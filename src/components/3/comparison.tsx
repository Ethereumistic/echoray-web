"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

const comparisons = [
    {
        bad: "Hidden fees that keep piling up",
        good: "Fixed monthly price, everything included",
    },
    {
        bad: "Weeks of waiting for simple changes",
        good: "Quick turnaround on all requests",
    },
    {
        bad: "Developers who speak in jargon",
        good: "Plain language you actually understand",
    },
    {
        bad: "Sites that break and no one to fix them",
        good: "Ongoing maintenance and support",
    },
    {
        bad: "One-size-fits-all templates",
        good: "Custom design for your specific needs",
    },
    {
        bad: "Abandoned after launch",
        good: "Long-term partnership as you grow",
    },
]

export function Comparison3() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        The difference is clear
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Compare us to typical web development experiences
                    </p>
                </motion.div>

                {/* Comparison table */}
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="text-center p-4">
                            <span className="text-sm font-semibold uppercase tracking-wider text-destructive">
                                The Old Way
                            </span>
                        </div>
                        <div className="text-center p-4">
                            <span className="text-sm font-semibold uppercase tracking-wider text-chart-1">
                                With Echoray
                            </span>
                        </div>
                    </div>

                    {comparisons.map((item, index) => (
                        <motion.div
                            key={index}
                            className="grid grid-cols-2 gap-4 mb-4"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                            {/* Bad */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                                <X className="w-5 h-5 text-destructive shrink-0" />
                                <span className="text-sm text-muted-foreground">{item.bad}</span>
                            </div>

                            {/* Good */}
                            <div className="flex items-center gap-3 p-4 rounded-xl bg-chart-1/5 border border-chart-1/10">
                                <Check className="w-5 h-5 text-chart-1 shrink-0" />
                                <span className="text-sm text-foreground font-medium">{item.good}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
