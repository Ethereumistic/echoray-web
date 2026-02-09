"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, MessageCircle } from "lucide-react"

export function CTA3() {
    return (
        <section className="py-24 md:py-32 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        Stop settling for less
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                        Get a website that actually works — built by a team that actually listens.
                        No more disappointments.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg font-semibold bg-background text-foreground hover:bg-background/90 group"
                            asChild
                        >
                            <Link href="/start-project">
                                Start Your Project
                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 text-lg font-semibold border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10"
                            asChild
                        >
                            <Link href="/contact">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Have Questions?
                            </Link>
                        </Button>
                    </div>

                    <p className="mt-8 text-sm text-primary-foreground/60">
                        We respond within 24 hours • No commitment required
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
