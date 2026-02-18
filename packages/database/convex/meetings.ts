import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

// =============================================
// CONSTANTS
// =============================================

const MIN_SUBMISSION_TIME_MS = 3000;
const MAX_BOOKING_DAYS_AHEAD = 45;
const RATE_LIMIT_IP_PER_HOUR = 5;
const RATE_LIMIT_EMAIL_PER_DAY = 3;
const RATE_LIMIT_BLOCK_DURATION_MS = 60 * 60 * 1000;

type BookingStatus =
  | "awaiting"
  | "confirmed"
  | "cancelled"
  | "passed"
  | "successful"
  | "ghosted";

// =============================================
// HELPER FUNCTIONS
// =============================================

async function checkAdmin(ctx: any): Promise<Id<"users">> {
  const userId = await auth.getUserId(ctx);
  if (!userId) throw new Error("Not authenticated");

  const user = await ctx.db.get(userId);
  if (!user || !user.subscriptionTierId)
    throw new Error("Unauthorized: No subscription tier");

  const tier = await ctx.db.get(user.subscriptionTierId);
  if (!tier) throw new Error("Unauthorized: Tier not found");

  const hasAdmin = (BigInt(tier.basePermissions) & (BigInt(1) << 50n)) !== 0n;
  if (!hasAdmin)
    throw new Error("Unauthorized: Staff admin permission required");

  return userId;
}

function hashIdentifier(identifier: string): string {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function endOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  ).getTime();
}

function isWeekend(timestamp: number): boolean {
  const day = new Date(timestamp).getDay();
  return day === 0 || day === 6;
}

// =============================================
// RATE LIMITING
// =============================================

async function checkRateLimit(
  ctx: any,
  identifier: string,
  identifierType: "ip" | "email",
): Promise<{ allowed: boolean; remainingAttempts: number }> {
  const hashedId = hashIdentifier(identifier);
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const existing = await ctx.db
    .query("meeting_book_rate_limits")
    .withIndex("by_identifier", (q: any) => q.eq("identifier", hashedId))
    .first();

  if (existing) {
    if (existing.blockedUntil && existing.blockedUntil > now) {
      return { allowed: false, remainingAttempts: 0 };
    }

    const cutoffTime = identifierType === "ip" ? oneHourAgo : oneDayAgo;
    const maxAttempts =
      identifierType === "ip"
        ? RATE_LIMIT_IP_PER_HOUR
        : RATE_LIMIT_EMAIL_PER_DAY;

    if (
      existing.lastAttemptAt > cutoffTime &&
      existing.attemptCount >= maxAttempts
    ) {
      await ctx.db.patch(existing._id, {
        blockedUntil: now + RATE_LIMIT_BLOCK_DURATION_MS,
      });
      return { allowed: false, remainingAttempts: 0 };
    }

    const recentAttempts =
      existing.lastAttemptAt > cutoffTime ? existing.attemptCount : 0;
    return {
      allowed: true,
      remainingAttempts: maxAttempts - recentAttempts - 1,
    };
  }

  const maxAttempts =
    identifierType === "ip" ? RATE_LIMIT_IP_PER_HOUR : RATE_LIMIT_EMAIL_PER_DAY;
  return { allowed: true, remainingAttempts: maxAttempts - 1 };
}

async function recordRateLimitAttempt(
  ctx: any,
  identifier: string,
  identifierType: "ip" | "email",
): Promise<void> {
  const hashedId = hashIdentifier(identifier);
  const now = Date.now();

  const existing = await ctx.db
    .query("meeting_book_rate_limits")
    .withIndex("by_identifier", (q: any) => q.eq("identifier", hashedId))
    .first();

  if (existing) {
    const cutoffTime =
      identifierType === "ip"
        ? now - 60 * 60 * 1000
        : now - 24 * 60 * 60 * 1000;
    const newCount =
      existing.lastAttemptAt > cutoffTime ? existing.attemptCount + 1 : 1;

    await ctx.db.patch(existing._id, {
      attemptCount: newCount,
      lastAttemptAt: now,
    });
  } else {
    await ctx.db.insert("meeting_book_rate_limits", {
      identifier: hashedId,
      identifierType,
      attemptCount: 1,
      firstAttemptAt: now,
      lastAttemptAt: now,
    });
  }
}

// =============================================
// PUBLIC MUTATIONS (No Auth Required)
// =============================================

export const createBooking = mutation({
  args: {
    fullName: v.string(),
    email: v.string(),
    phone: v.string(),
    meetingDate: v.number(),
    timeSlot: v.string(),
    timezone: v.string(),
    _honeypot: v.optional(v.string()),
    _submissionTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // --- LAYER 1: Honeypot Check ---
    if (args._honeypot && args._honeypot.trim() !== "") {
      return {
        success: true,
        bookingId: null,
        message: "Booking submitted successfully!",
      };
    }

    // --- LAYER 2: Time-Based Check ---
    if (args._submissionTimeMs < MIN_SUBMISSION_TIME_MS) {
      return {
        success: true,
        bookingId: null,
        message: "Booking submitted successfully!",
      };
    }

    // --- LAYER 3: Rate Limiting ---
    const clientIp = "unknown";
    const rateLimitResult = await checkRateLimit(ctx, clientIp, "ip");
    if (!rateLimitResult.allowed) {
      return {
        success: true,
        bookingId: null,
        message: "Booking submitted successfully!",
      };
    }

    const emailRateLimit = await checkRateLimit(ctx, args.email, "email");
    if (!emailRateLimit.allowed) {
      return {
        success: true,
        bookingId: null,
        message: "Booking submitted successfully!",
      };
    }

    // --- Validate Booking Window ---
    const bookingDate = new Date(args.meetingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return {
        success: false,
        bookingId: null,
        message: "Cannot book a date in the past",
      };
    }

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + MAX_BOOKING_DAYS_AHEAD);
    if (bookingDate > maxDate) {
      return {
        success: false,
        bookingId: null,
        message: `Cannot book more than ${MAX_BOOKING_DAYS_AHEAD} days ahead`,
      };
    }

    // --- Check if weekend is blocked ---
    const weekendBlock = await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("isWeekend"), true),
          q.eq(q.field("isActive"), true),
        ),
      )
      .first();

    if (weekendBlock && isWeekend(args.meetingDate)) {
      return {
        success: false,
        bookingId: null,
        message: "Weekend bookings are not available",
      };
    }

    // --- Check for specific blocked dates ---
    const dayStart = startOfDay(args.meetingDate);
    const dayEnd = endOfDay(args.meetingDate);

    const blockedRecords = await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();

    const isBlocked = blockedRecords.some((record: any) => {
      if (record.date && record.date === dayStart) return true;
      if (record.dateStart && record.dateEnd) {
        return dayStart >= record.dateStart && dayStart <= record.dateEnd;
      }
      return false;
    });

    if (isBlocked) {
      return {
        success: false,
        bookingId: null,
        message: "This date is not available for booking",
      };
    }

    // --- Check Slot Availability ---
    const existingBooking = await ctx.db
      .query("meeting_bookings")
      .withIndex("by_date_slot", (q: any) =>
        q.eq("meetingDate", dayStart).eq("timeSlot", args.timeSlot),
      )
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .first();

    if (existingBooking) {
      return {
        success: false,
        bookingId: null,
        message: "This time slot is already booked",
      };
    }

    // --- Record Rate Limit ---
    await recordRateLimitAttempt(ctx, clientIp, "ip");
    await recordRateLimitAttempt(ctx, args.email, "email");

    // --- Create Booking ---
    const bookingId = await ctx.db.insert("meeting_bookings", {
      fullName: args.fullName,
      email: args.email.toLowerCase().trim(),
      phone: args.phone,
      meetingDate: dayStart,
      timeSlot: args.timeSlot,
      timezone: args.timezone,
      status: "awaiting",
      honeypotTriggered: false,
      submissionTimeMs: args._submissionTimeMs,
      clientIp: clientIp,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      bookingId,
      message: "Booking submitted successfully! We'll contact you soon.",
    };
  },
});

export const getBookingAvailability = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const blockedDates: number[] = [];
    const bookedSlots: Record<string, string[]> = {};

    const weekendBlock = await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("isWeekend"), true),
          q.eq(q.field("isActive"), true),
        ),
      )
      .first();

    const blockedRecords = await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .collect();

    for (const record of blockedRecords) {
      if (record.date) {
        blockedDates.push(record.date);
      } else if (record.dateStart && record.dateEnd) {
        let current = record.dateStart;
        while (current <= record.dateEnd) {
          if (!weekendBlock || !isWeekend(current)) {
            blockedDates.push(current);
          }
          const nextDay = new Date(current);
          nextDay.setDate(nextDay.getDate() + 1);
          current = nextDay.getTime();
        }
      }
    }

    if (weekendBlock) {
      let current = args.startDate;
      while (current <= args.endDate) {
        if (isWeekend(current)) {
          blockedDates.push(startOfDay(current));
        }
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);
        current = nextDay.getTime();
      }
    }

    const bookings = await ctx.db
      .query("meeting_bookings")
      .filter((q: any) =>
        q.and(
          q.gte(q.field("meetingDate"), args.startDate),
          q.lte(q.field("meetingDate"), args.endDate),
          q.neq(q.field("status"), "cancelled"),
        ),
      )
      .collect();

    for (const booking of bookings) {
      const dateKey = booking.meetingDate.toString();
      if (!bookedSlots[dateKey]) {
        bookedSlots[dateKey] = [];
      }
      bookedSlots[dateKey].push(booking.timeSlot);
    }

    return { blockedDates, bookedSlots, weekendBlocked: !!weekendBlock };
  },
});

// =============================================
// ADMIN QUERIES
// =============================================

export const listBookings = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("awaiting"),
        v.literal("confirmed"),
        v.literal("cancelled"),
        v.literal("passed"),
        v.literal("successful"),
        v.literal("ghosted"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const limit = args.limit || 50;

    if (args.status) {
      return await ctx.db
        .query("meeting_bookings")
        .withIndex("by_status", (q: any) =>
          q.eq("status", args.status as BookingStatus),
        )
        .order("desc")
        .take(limit);
    }

    return await ctx.db.query("meeting_bookings").order("desc").take(limit);
  },
});

export const getBooking = query({
  args: { id: v.id("meeting_bookings") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    return await ctx.db.get(args.id);
  },
});

export const getBookingStats = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);

    const allBookings = await ctx.db.query("meeting_bookings").collect();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const stats = {
      total: allBookings.length,
      awaiting: 0,
      confirmed: 0,
      cancelled: 0,
      passed: 0,
      successful: 0,
      ghosted: 0,
      thisWeek: 0,
      thisMonth: 0,
      conversionRate: 0,
      ghostRate: 0,
    };

    for (const booking of allBookings) {
      stats[booking.status as keyof typeof stats]++;

      if (booking.createdAt >= weekAgo) {
        stats.thisWeek++;
      }
      if (booking.createdAt >= monthAgo) {
        stats.thisMonth++;
      }
    }

    const completedBookings = stats.successful + stats.ghosted;
    if (completedBookings > 0) {
      stats.conversionRate = Math.round(
        (stats.successful / completedBookings) * 100,
      );
      stats.ghostRate = Math.round((stats.ghosted / completedBookings) * 100);
    }

    return stats;
  },
});

// =============================================
// ADMIN MUTATIONS
// =============================================

export const updateBookingStatus = mutation({
  args: {
    id: v.id("meeting_bookings"),
    status: v.union(
      v.literal("awaiting"),
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("passed"),
      v.literal("successful"),
      v.literal("ghosted"),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await checkAdmin(ctx);
    const now = Date.now();

    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      notes: args.notes ?? booking.notes,
      statusChangedAt: now,
      statusChangedBy: userId,
      updatedAt: now,
    });

    return args.id;
  },
});

export const rescheduleBooking = mutation({
  args: {
    id: v.id("meeting_bookings"),
    meetingDate: v.number(),
    timeSlot: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    const now = Date.now();

    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    const existingBooking = await ctx.db
      .query("meeting_bookings")
      .withIndex("by_date_slot", (q: any) =>
        q.eq("meetingDate", args.meetingDate).eq("timeSlot", args.timeSlot),
      )
      .filter((q: any) => q.neq(q.field("_id"), args.id))
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .first();

    if (existingBooking) {
      throw new Error("This time slot is already booked");
    }

    await ctx.db.patch(args.id, {
      meetingDate: args.meetingDate,
      timeSlot: args.timeSlot,
      updatedAt: now,
    });

    return args.id;
  },
});

export const addBookingNote = mutation({
  args: {
    id: v.id("meeting_bookings"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);

    const booking = await ctx.db.get(args.id);
    if (!booking) throw new Error("Booking not found");

    await ctx.db.patch(args.id, {
      notes: args.notes,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

// =============================================
// BLOCKED DATES MANAGEMENT
// =============================================

export const listBlockedDates = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    return await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) => q.eq(q.field("isActive"), true))
      .order("desc")
      .collect();
  },
});

export const createBlockedDate = mutation({
  args: {
    date: v.optional(v.number()),
    dateStart: v.optional(v.number()),
    dateEnd: v.optional(v.number()),
    reason: v.optional(v.string()),
    isWeekend: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await checkAdmin(ctx);

    if (!args.date && !args.dateStart && !args.isWeekend) {
      throw new Error(
        "Must provide either date, date range, or isWeekend flag",
      );
    }

    return await ctx.db.insert("meeting_book_blocked_dates", {
      date: args.date,
      dateStart: args.dateStart,
      dateEnd: args.dateEnd,
      reason: args.reason,
      isWeekend: args.isWeekend,
      isActive: true,
      createdBy: userId,
      createdAt: Date.now(),
    });
  },
});

export const deleteBlockedDate = mutation({
  args: { id: v.id("meeting_book_blocked_dates") },
  handler: async (ctx, args) => {
    await checkAdmin(ctx);
    await ctx.db.patch(args.id, { isActive: false });
    return args.id;
  },
});

export const toggleWeekendBlock = mutation({
  args: { enable: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await checkAdmin(ctx);

    const existing = await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) => q.eq(q.field("isWeekend"), true))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { isActive: args.enable });
      return existing._id;
    }

    if (args.enable) {
      return await ctx.db.insert("meeting_book_blocked_dates", {
        isWeekend: true,
        reason: "Weekend",
        isActive: true,
        createdBy: userId,
        createdAt: Date.now(),
      });
    }

    return null;
  },
});

export const getWeekendBlockStatus = query({
  args: {},
  handler: async (ctx) => {
    await checkAdmin(ctx);
    const weekendBlock = await ctx.db
      .query("meeting_book_blocked_dates")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("isWeekend"), true),
          q.eq(q.field("isActive"), true),
        ),
      )
      .first();
    return !!weekendBlock;
  },
});
