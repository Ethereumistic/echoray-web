"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useState } from "react"

const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00"
]

export function CTA5() {
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined)

    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Desktop: 2 columns */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left column - Content */}
                        <motion.div
                            className="text-center lg:text-left"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Value reminder */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-chart-1/10 text-chart-1 rounded-full text-sm font-semibold mb-8">
                                From €99/month • No setup fee • Cancel anytime
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                                Book your slot now!
                            </h2>
                            <p className="text-xl text-muted-foreground mb-10 max-w-xl">
                                Join hundreds of businesses that trust us with their online presence.
                                Start today and see results in days, not months.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                                <Button size="lg" className="h-14 px-10 text-lg font-semibold group" asChild>
                                    <Link href="/start-project">
                                        Get Started Now
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-10 text-lg font-semibold"
                                    asChild
                                >
                                    <Link href="/contact">
                                        <Phone className="mr-2 h-5 w-5" />
                                        Book a Free Call
                                    </Link>
                                </Button>
                            </div>

                            {/* Trust signals */}
                            <div className="mt-12 flex flex-wrap items-center lg:justify-start justify-center gap-8 text-sm text-muted-foreground">
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-chart-1 rounded-full" />
                                    No credit card required
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-chart-1 rounded-full" />
                                    24h response time
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-chart-1 rounded-full" />
                                    100+ happy clients
                                </span>
                            </div>
                        </motion.div>

                        {/* Right column - Calendar */}
                        <motion.div
                            className="bg-card border rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold mb-4 text-center">Select Date & Time (Europe/Sofia)</h3>
                            <div className="flex flex-col items-center">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="mb-4"
                                    disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                                />
                                {date && (
                                    <div className="w-full mt-4">
                                        <p className="text-sm font-medium mb-3 text-center">Available Time Slots</p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {timeSlots.map((time) => (
                                                <button
                                                    key={time}
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`px-3 py-2 text-xs rounded-md transition-colors ${
                                                        selectedTime === time
                                                            ? "bg-primary text-primary-foreground"
                                                            : "bg-muted hover:bg-muted/80"
                                                    }`}
                                                >
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                        {selectedTime && (
                                            <Button className="w-full mt-4" size="sm">
                                                Confirm Booking for {date.toLocaleDateString("en-GB")} at {selectedTime}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Mobile: Original layout */}
                    <motion.div
                        className="lg:hidden text-center"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Value reminder */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-chart-1/10 text-chart-1 rounded-full text-sm font-semibold mb-8">
                            From €99/month • No setup fee • Cancel anytime
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Book your slot now!
                        </h2>
                        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                            Join hundreds of businesses that trust us with their online presence.
                            Start today and see results in days, not months.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="h-14 px-10 text-lg font-semibold group" asChild>
                                <Link href="/start-project">
                                    Get Started Now
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="h-14 px-10 text-lg font-semibold"
                                asChild
                            >
                                <Link href="/contact">
                                    <Phone className="mr-2 h-5 w-5" />
                                    Book a Free Call
                                </Link>
                            </Button>
                        </div>

                        {/* Trust signals */}
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-chart-1 rounded-full" />
                                No credit card required
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-chart-1 rounded-full" />
                                24h response time
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-chart-1 rounded-full" />
                                100+ happy clients
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export function CTA5Compact() {
    return (
        <div className="h-full w-full bg-background overflow-auto border-2 border-dashed border-primary ">
            <div className="p-4 flex flex-col items-center justify-center min-h-full text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-chart-1/10 text-chart-1 rounded-full text-[10px] font-semibold mb-3">
                    From €99/month • Cancel anytime
                </div>

                <h2 className="text-sm font-bold tracking-tight mb-2 leading-tight">
                    Book your slot now!
                </h2>
                <p className="text-[10px] text-muted-foreground mb-3 max-w-[200px]">
                    Join hundreds of businesses that trust us with their online presence.
                </p>

                <div className="flex flex-col gap-2 w-full max-w-[180px]">
                    <Button size="sm" className="h-7 text-[10px] font-semibold w-full" asChild>
                        <Link href="/start-project">
                            Get Started
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] font-semibold w-full"
                        asChild
                    >
                        <Link href="/contact">
                            <Phone className="mr-1 h-3 w-3" />
                            Book a Call
                        </Link>
                    </Button>
                </div>

                {/* Trust signals */}
                <div className="mt-4 flex flex-col items-center gap-1 text-[8px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-chart-1 rounded-full" />
                        No credit card required
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-chart-1 rounded-full" />
                        24h response time
                    </span>
                </div>
            </div>
        </div>
    )
}
