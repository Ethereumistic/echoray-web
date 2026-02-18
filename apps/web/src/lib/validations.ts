import { z } from "zod";

/**
 * Common Zod schemas for the application.
 * Using Zod allows us to define schemas and infer Typescript types automatically.
 */

// Schema for organization creation/update
export const organizationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  description: z.string().max(500).optional().nullable(),
});

export type OrganizationFormValues = z.infer<typeof organizationSchema>;

// Schema for member invitation
export const inviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  roleIds: z.array(z.string()).min(1, "At least one role must be selected"),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;

// Schema for profile update
export const profileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

// Schema for meeting booking
export const meetingBookingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Invalid phone number").max(20),
  meetingDate: z.number().positive("Invalid date"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time slot format"),
  timezone: z.string().min(1, "Timezone is required"),
});

export type MeetingBookingFormValues = z.infer<typeof meetingBookingSchema>;

export const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
] as const;

export type BookingStatus =
  | "awaiting"
  | "confirmed"
  | "cancelled"
  | "passed"
  | "successful"
  | "ghosted";

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string }
> = {
  awaiting: {
    label: "Awaiting",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  passed: {
    label: "Passed",
    color: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  },
  successful: {
    label: "Successful",
    color: "bg-green-500/15 text-green-400 border-green-500/30",
  },
  ghosted: {
    label: "Ghosted",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
};
