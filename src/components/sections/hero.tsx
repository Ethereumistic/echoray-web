"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HeroBackground } from "./hero-background"

const stats = [
    { label: "Projects Delivered", value: "50+" },
    { label: "Client Satisfaction", value: "98%" },
    { label: "Years Experience", value: "5+" },
]

export function Hero() {
    return (
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden py-20 md:py-32">
            <HeroBackground />

            <div className="container relative z-10 mx-auto flex flex-col items-center text-center px-4 md:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-medium">
                        Web Development Excellence
                    </Badge>
                </motion.div>

                <motion.h1
                    className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    We Build Digital Solutions That <span className="text-primary">Drive Business Growth</span>
                </motion.h1>

                <motion.p
                    className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    From simple websites to enterprise CRMs, Echoray.io brings clarity to the web&apos;s complexity.
                </motion.p>

                <motion.div
                    className="mt-10 flex flex-col gap-4 sm:flex-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Button size="lg" asChild className="h-12 px-8 text-base">
                        <Link href="/start-project">Start Your Project</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                        <Link href="/work">View Our Work</Link>
                    </Button>
                </motion.div>

                <motion.div
                    className="mt-20 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    {stats.map((stat, index) => (
                        <div key={index} className="flex flex-col items-center">
                            <span className="text-4xl font-bold md:text-5xl">{stat.value}</span>
                            <span className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent z-20 pointer-events-none" />
        </section>
    )
}
