"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function CTA4() {
    return (
        <section className="py-32 md:py-40">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    className="max-w-3xl mx-auto text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-6 block">
                        Begin
                    </span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight mb-8">
                        Ready to create something
                        <br />
                        <span className="text-primary italic">extraordinary</span>?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
                        Let&apos;s discuss how we can bring your vision to life.
                    </p>

                    <Button
                        size="lg"
                        className="h-14 px-12 text-base font-medium tracking-wide"
                        asChild
                    >
                        <Link href="/start-project">Start a Conversation</Link>
                    </Button>

                    <p className="mt-12 text-sm text-muted-foreground">
                        We respond within 24 hours
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
