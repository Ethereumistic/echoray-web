"use client";

import { Calendar } from "@echoray/ui/components/ui/calendar";
import { useState, useRef, useMemo } from "react";
import { Input } from "@echoray/ui/components/ui/input";
import { Button } from "@echoray/ui/components/ui/button";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@echoray/ui/components/ui/command";

import { PhoneInput } from "@echoray/ui/components/ui/phone-input";
import type { Value } from "react-phone-number-input";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { TIME_SLOTS } from "@/lib/validations";
import { cn } from "@echoray/ui/lib/utils";

interface MobileBookProps {
  title?: string;
  subtitle?: string;
}

export function MobileBook({
  title = "Book your slot now!",
  subtitle = "Book a quick 15-min call. No pressure, just real solutions.",
}: MobileBookProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState<Value | undefined>(undefined);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const formLoadedAt = useRef(Date.now());

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const createBooking = useMutation(api.meetings.createBooking);

  const { startDate, endDate, today, maxDate } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 45);
    return {
      startDate: today.getTime(),
      endDate: maxDate.getTime(),
      today,
      maxDate,
    };
  }, []);

  const availability = useQuery(api.meetings.getBookingAvailability, {
    startDate,
    endDate,
  });

  const blockedDates = availability?.blockedDates.map((d) => new Date(d)) || [];
  const bookedSlots = availability?.bookedSlots || {};
  const weekendBlocked = availability?.weekendBlocked || false;

  const isDateBlocked = (checkDate: Date): boolean => {
    const dateNum = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth(),
      checkDate.getDate(),
    ).getTime();
    return blockedDates.some((d) => d.getTime() === dateNum);
  };

  const isTimeSlotBooked = (
    checkDate: Date | undefined,
    slot: string,
  ): boolean => {
    if (!checkDate) return false;
    const dateNum = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth(),
      checkDate.getDate(),
    ).getTime();
    const slots = bookedSlots[dateNum.toString()];
    return slots ? slots.includes(slot) : false;
  };

  const availableTimeSlots = TIME_SLOTS.filter(
    (slot) => !isTimeSlotBooked(date, slot),
  );

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone || !date || !selectedTime) {
      setErrorMessage("Please fill in all fields");
      setStatus("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    const meetingDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();

    const submissionTimeMs = Date.now() - formLoadedAt.current;

    try {
      const result = await createBooking({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone!.toString(),
        meetingDate,
        timeSlot: selectedTime,
        timezone: "Europe/Sofia",
        _honeypot: honeypot,
        _submissionTimeMs: submissionTimeMs,
      });

      if (result.success && result.bookingId) {
        setStatus("success");
        setFullName("");
        setEmail("");
        setPhone(undefined);
        setSelectedTime(undefined);
        setDate(new Date());
      } else if (!result.success) {
        setErrorMessage(result.message || "Failed to create booking");
        setStatus("error");
      } else {
        setStatus("success");
      }
    } catch (err) {
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const isFormValid =
    fullName.trim() && email.trim() && phone && date && selectedTime;

  if (status === "success") {
    return (
      <div className="w-full overflow-hidden bg-primary p-4 scroll-mt-32">
        <div className="flex flex-col items-center text-center py-8">
          <div className="size-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            We'll send you a confirmation email shortly.
          </p>
          <Button
            variant="outline"
            onClick={() => setStatus("idle")}
            className="bg-background!"
          >
            Book Another Slot
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-primary p-4 scroll-mt-32">
      <div className="flex flex-col items-center text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight leading-tight">
          {title}
        </h2>
        <p className="text-sm mt-2 leading-relaxed">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-2 w-full mt-4 px-6">
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
          aria-hidden="true"
        >
          <label htmlFor="website">Leave this empty</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="one-time-code"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <Input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="h-9 bg-background! text-base"
          disabled={status === "loading"}
        />
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-9 bg-background! text-base"
          disabled={status === "loading"}
        />

        <PhoneInput
          placeholder="Phone number"
          value={phone}
          onChange={setPhone}
          defaultCountry="BG"
          className="h-9 **:[input]:h-9 text-base **:[input]:text-base **:[button]:h-9 **:[input]:bg-background! **:[button]:bg-background! **:[input]:focus-visible:ring-0 **:[button]:focus-visible:ring-0 **:[input]:focus-visible:border-input **:[button]:focus-visible:border-input rounded-md"
          disabled={status === "loading"}
        />
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          fixedWeeks
          disabled={[
            { before: today },
            { after: maxDate },
            (d) => isDateBlocked(d),
          ]}
          className="rounded-md border shadow-sm bg-card p-2 mx-auto"
        />

        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 text-sm w-full justify-start font-normal text-muted-foreground bg-background!",
            !selectedTime && availableTimeSlots.length === 0 && "text-red-400",
          )}
          onClick={() => setOpen(true)}
          disabled={status === "loading"}
        >
          <Clock className="mr-2 h-4 w-4" />
          {selectedTime
            ? `Time: ${selectedTime} (Sofia)`
            : availableTimeSlots.length === 0
              ? "No slots available"
              : "Select time slot"}
        </Button>

        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 p-2 rounded-md">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          size="lg"
          className="cursor-pointer bg-black hover:bg-black text-sm font-semibold w-full mt-1 group"
          onClick={handleSubmit}
          disabled={status === "loading" || !isFormValid}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-lg">
        <Command>
          <CommandList className="max-h-104 overflow-x-hidden">
            <CommandEmpty>No slots found.</CommandEmpty>
            <CommandGroup
              heading="Available Times"
              className="**:[[cmdk-group-items]]:grid **:[[cmdk-group-items]]:grid-cols-3 **:[[cmdk-group-items]]:gap-1"
            >
              {TIME_SLOTS.map((time) => {
                const isBooked = isTimeSlotBooked(date, time);
                return (
                  <CommandItem
                    key={time}
                    disabled={isBooked}
                    onSelect={() => {
                      if (!isBooked) {
                        setSelectedTime(time);
                        setOpen(false);
                      }
                    }}
                    className={cn(
                      "text-[10px] py-1.5 cursor-pointer justify-center rounded-md",
                      isBooked && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    <Clock className="mr-1.5 h-3 w-3 shrink-0" />
                    <span className="text-base font-semibold">{time}</span>
                    {isBooked && (
                      <span className="ml-1 text-[8px] text-red-400">
                        Taken
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}
