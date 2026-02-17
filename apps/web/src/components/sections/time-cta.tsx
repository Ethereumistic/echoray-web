"use client"

import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

import { PhoneInput } from "@/components/ui/phone-input"
import type { Value } from "react-phone-number-input"

const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
]

export function TimeCTA() {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)
    const [open, setOpen] = useState(false)
    const [phone, setPhone] = useState<Value>("" as Value)

    return (
        <div className="w-lg h-88 bg-background rounded-md border-2 border-dotted border-primary overflow-hidden mx-auto ">
            <div className="flex flex-col items-center justify-center h-full px-6">
                {/* Centered Header */}
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl font-bold tracking-tight leading-tight mt-4">
                        Book your slot now!
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 items-center w-full ">
                    {/* Left Column: Calendar */}
                    <div className="flex flex-col items-center justify-center scale-80 -ml-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            fixedWeeks
                            className="rounded-md border shadow-sm bg-card p-1 [--cell-size:35px]"
                        />
                    </div>

                    {/* Right Column: Inputs */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left h-full justify-center">
                        <p className="text-sm text-muted-foreground mb-4  leading-relaxed">
                            Book a quick 15-min call.<br /> No pressure, just real solutions.
                        </p>

                        <div className="flex flex-col gap-2 w-full max-w-xl">
                            <Input
                                type="email"
                                placeholder="Email address"
                                className="h-7 bg-background"
                            />

                            <PhoneInput
                                placeholder="Phone number"
                                value={phone}
                                onChange={setPhone}
                                defaultCountry="BG"
                                className="h-7 **:[input]:h-7 **:[input]:text-xs **:[button]:h-7"
                            />

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs w-full justify-start font-normal text-muted-foreground"
                                onClick={() => setOpen(true)}
                            >
                                <Clock className="mr-2 h-3 w-3" />
                                {selectedTime ? `Time: ${selectedTime} (Sofia)` : "Select time slot"}
                            </Button>

                            <Button size="sm" className="h-7 text-xs font-semibold w-full mt-1">
                                Confirm Booking
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-lg">
                <Command>
                    <CommandInput placeholder="Search slots..." className="h-8 text-base" />
                    <CommandList className="max-h-104 overflow-x-hidden">
                        <CommandEmpty>No slots found.</CommandEmpty>
                        <CommandGroup
                            heading="Available Times"
                            className="**:[[cmdk-group-items]]:grid **:[[cmdk-group-items]]:grid-cols-3 **:[[cmdk-group-items]]:gap-1"
                        >
                            {timeSlots.map((time) => (
                                <CommandItem
                                    key={time}
                                    onSelect={() => {
                                        setSelectedTime(time)
                                        setOpen(false)
                                    }}
                                    className="text-[10px] py-1.5 cursor-pointer justify-center rounded-md"
                                >
                                    <Clock className="mr-1.5 h-3 w-3 shrink-0" />
                                    <span className="text-base font-semibold">{time}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>

            {/* <div className=" flex items-center justify-between text-sm text-muted-foreground px-8 -mt-6">
                <span className="flex items-center gap-2 text-[10px]">
                    <span className="w-2 h-2 bg-chart-1 rounded-full" />
                    7 day launch time
                </span>
                <span className="flex items-center gap-2 text-[10px]">
                    <span className="w-2 h-2  bg-chart-1 rounded-full" />
                    24h response time
                </span>
                <span className="flex items-center gap-2 text-[10px]">
                    <span className="w-2 h-2 bg-chart-1 rounded-full" />
                    Many happy clients
                </span>
            </div> */}

        </div>
    )
}
