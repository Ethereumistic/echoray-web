"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA1() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-chart-4/10" />

            {/* Animated shapes */}
            <motion.div
                className="absolute top-1/2 left-1/4 w-72 h-72 rounded-full bg-primary/20 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-chart-4/20 blur-3xl"
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <motion.div
                    className="max-w-4xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                        Ready to build something{" "}
                        <span className="text-primary">great?</span>
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Let&apos;s talk about your project. No pressure, no jargon —
                        just a friendly conversation about what you need.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 px-10 text-lg font-semibold group" asChild>
                            <Link href="/start-project">
                                Start Your Project
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 text-lg font-semibold bg-background/50 backdrop-blur-sm"
                            asChild
                        >
                            <Link href="/contact">Book a Free Call</Link>
                        </Button>
                    </div>

                    <p className="mt-8 text-sm text-muted-foreground">
                        Usually respond within 24 hours
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
