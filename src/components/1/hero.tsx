"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero1() {
    return (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

            {/* Floating orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-chart-4/10 blur-3xl"
                animate={{
                    x: [0, -40, 0],
                    y: [0, 40, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="container relative z-10 mx-auto px-4 md:px-6 py-16">
                <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                    {/* Trust badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                            <span className="w-2 h-2 rounded-full bg-chart-1 animate-pulse" />
                            Trusted by businesses worldwide
                        </span>
                    </motion.div>

                    {/* Main headline */}
                    <motion.h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        Your Website.
                        <br />
                        <span className="bg-gradient-to-r from-primary via-chart-4 to-primary bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                            Built Right.
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        From personal portfolios to complex business systems —
                        we craft digital experiences that work as hard as you do.
                    </motion.p>

                    {/* CTA buttons */}
                    <motion.div
                        className="mt-12 flex flex-col sm:flex-row gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <Button size="lg" className="h-14 px-8 text-lg font-semibold group" asChild>
                            <Link href="/start-project">
                                Start Your Project
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-8 text-lg font-semibold bg-background/50 backdrop-blur-sm group"
                            asChild
                        >
                            <Link href="/work">
                                <Play className="mr-2 h-5 w-5" />
                                See Our Work
                            </Link>
                        </Button>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        className="mt-20 grid grid-cols-3 gap-8 md:gap-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        {[
                            { number: "100+", label: "Projects Delivered" },
                            { number: "98%", label: "Client Satisfaction" },
                            { number: "24h", label: "Response Time" },
                        ].map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary">{stat.number}</div>
                                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </section>
    )
}
