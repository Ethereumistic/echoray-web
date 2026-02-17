"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@echoray/ui/components/ui/button"
import { ArrowRight } from "lucide-react"
import { HeroBackground } from "@/components/sections/hero-background"
import { HeroLogoMarquee } from "@/components/sections/logo-cloud"
import { PhoneMock } from "./phone-mock"

// Staggered fade-up variants for children
const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1,
        },
    },
}

const fadeUp = {
    hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: {
            duration: 0.7,
            ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
        },
    },
}

const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
        },
    },
}

export function Hero5() {
    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="hidden xl:flex ">
                <HeroBackground />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 sm:gap-0 items-center">
                        {/* Main content — 7 of 12 columns on desktop */}
                        <motion.div
                            className="lg:col-span-7 text-center lg:text-right"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Headline */}
                            <motion.h1
                                className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.2] mb-6"
                                variants={fadeUp}
                            >
                                <span className="text-nowrap ">A professional website</span>
                                <br />
                                <span className="text-primary">that pays for itself</span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                className="text-lg sm:text-[1.38rem] text-muted-foreground mb-8 leading-relaxed"
                                variants={fadeUp}
                            >
                                Your website is your hardest-working salesperson. <br />
                                Make sure it&apos;s actually working for you.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                className="flex flex-col flex-row gap-4 justify-center lg:justify-end"
                                variants={fadeUp}
                            >
                                <Button size="lg" className="h-12 px-4 md:px-8 text-base group" asChild>
                                    <Link href="/start-project">
                                        Start Your Project
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-4 md:px-8 text-base bg-background/50 backdrop-blur-sm"
                                    asChild
                                >
                                    <Link href="/work">Our Work</Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Phone mockup — 5 of 12 columns */}
                        <motion.div
                            className="lg:col-span-5 flex justify-center lg:justify-start translate-x-0 md:-translate-x-8"
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            <PhoneMock />
                        </motion.div>
                    </div>
                </div>

            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
        </section>
    )
}
