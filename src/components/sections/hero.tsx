"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { HeroBackground } from "./hero-background"
import { HeroLogoMarquee } from "./logo-cloud"

export function Hero() {
    return (
        <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden py-16 md:py-32">
            <div className="hidden xl:flex">
                <HeroBackground />
            </div>

            <div className="container relative z-10 mx-auto flex flex-col items-center text-center px-4 md:px-6">

                <motion.h1
                    className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    We Build Digital Solutions That <span className="text-primary"> <br className="block md:hidden" />Drive Business Growth </span>
                </motion.h1>

                <motion.p
                    className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    From modern wesbites to enterprise CRMs, Echoray.io brings clarity to the web&apos;s complexity.
                </motion.p>

                <motion.div
                    className="mt-10 flex gap-4 flex-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Button size="lg" asChild className="h-12 px-4 md:px-8 text-base">
                        <Link href="/start-project">Start Your Project</Link>
                    </Button>
                    <Button variant="outline" size="lg" asChild className="h-12 px-4 md:px-8 text-base bg-background/50 backdrop-blur-sm">
                        <Link href="/work">Our Work</Link>
                    </Button>
                </motion.div>

                {/* Trusted Partners Logo Marquee */}
                <motion.div
                    className="mt-16 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <p className="mb-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Trusted by
                    </p>
                    <HeroLogoMarquee />
                </motion.div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent z-20 pointer-events-none" />
        </section>
    )
}
