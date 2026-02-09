"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Check, ArrowRight } from "lucide-react"

const problems = [
    "Paying someone who disappeared mid-project",
    "Getting a site that looks nothing like promised",
    "Hidden fees that keep piling up",
    "Waiting months for simple updates",
]

export function Hero3() {
    return (
        <section className="relative py-20 md:py-32 overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 via-background to-background" />

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Problem statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12"
                    >
                        <p className="text-destructive font-semibold uppercase tracking-wider text-sm mb-6">
                            Sound familiar?
                        </p>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-8">
                            Tired of web developers who{" "}
                            <span className="line-through text-muted-foreground/50">overpromise</span>{" "}
                            and{" "}
                            <span className="line-through text-muted-foreground/50">underdeliver</span>?
                        </h1>
                    </motion.div>

                    {/* Pain points list */}
                    <motion.div
                        className="mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <ul className="space-y-4">
                            {problems.map((problem, index) => (
                                <motion.li
                                    key={problem}
                                    className="flex items-center gap-4 text-lg text-muted-foreground"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                                >
                                    <X className="w-5 h-5 text-destructive shrink-0" />
                                    {problem}
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Transition to solution */}
                    <motion.div
                        className="border-t border-border pt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">
                            There&apos;s a better way.
                        </h2>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                            We build websites with{" "}
                            <strong className="text-foreground">clear pricing</strong>,{" "}
                            <strong className="text-foreground">transparent timelines</strong>, and{" "}
                            <strong className="text-foreground">ongoing support</strong> that doesn&apos;t
                            disappear after launch.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-14 px-8 text-lg font-semibold group" asChild>
                                <Link href="/start-project">
                                    See How We&apos;re Different
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                className="h-14 px-8 text-lg font-semibold"
                                asChild
                            >
                                <Link href="#pricing">View Pricing</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
