"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { MessageSquare, Mail } from "lucide-react"

export function CTA2() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Option 1 - Start Project */}
                        <div className="p-10 rounded-3xl bg-primary text-primary-foreground">
                            <MessageSquare className="w-12 h-12 mb-6 opacity-80" />
                            <h3 className="text-2xl font-bold mb-3">Ready to start?</h3>
                            <p className="text-primary-foreground/80 mb-8 leading-relaxed">
                                Tell us about your project and we&apos;ll get back to you within 24 hours.
                            </p>
                            <Button
                                size="lg"
                                variant="secondary"
                                className="w-full h-12 font-semibold bg-background text-foreground hover:bg-background/90"
                                asChild
                            >
                                <Link href="/start-project">Start Your Project</Link>
                            </Button>
                        </div>

                        {/* Option 2 - Book a Call */}
                        <div className="p-10 rounded-3xl bg-card border border-border">
                            <Mail className="w-12 h-12 mb-6 text-primary" />
                            <h3 className="text-2xl font-bold mb-3">Have questions?</h3>
                            <p className="text-muted-foreground mb-8 leading-relaxed">
                                Book a free 15-minute call. We&apos;ll answer your questions and see if we&apos;re a good fit.
                            </p>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full h-12 font-semibold"
                                asChild
                            >
                                <Link href="/contact">Book a Free Call</Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
