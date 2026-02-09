"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function Hero4() {
    return (
        <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-background">
            {/* Elegant background pattern */}
            <div className="absolute inset-0 opacity-[0.02]">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Gradient accents */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-chart-4/5 to-transparent" />

            <div className="container relative z-10 mx-auto px-4 md:px-6 py-20">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Overline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground">
                            Digital Craftsmanship
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[0.95] mb-8"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                    >
                        Websites built with
                        <br />
                        <span className="text-primary italic">intention</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        We create digital experiences that reflect the quality
                        and ambition of your business.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Button
                            size="lg"
                            className="h-14 px-10 text-base font-medium tracking-wide"
                            asChild
                        >
                            <Link href="/start-project">Begin Your Project</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="h-14 px-10 text-base font-medium tracking-wide"
                            asChild
                        >
                            <Link href="/work">View Portfolio</Link>
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-12 left-1/2 -translate-x-1/2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
            >
                <motion.div
                    className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </motion.div>
        </section>
    )
}
