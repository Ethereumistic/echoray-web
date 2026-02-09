"use client"

import { motion } from "framer-motion"
import { MessageSquare, Palette, Code2, Rocket, CheckCircle2 } from "lucide-react"

const steps = [
    {
        icon: MessageSquare,
        title: "Tell us what you need",
        description: "Quick call to understand your business and goals. No tech talk, just conversation.",
    },
    {
        icon: Palette,
        title: "We design your solution",
        description: "You get to see and approve the design before any development starts.",
    },
    {
        icon: Code2,
        title: "We build it",
        description: "Our team creates your website or system. You stay updated throughout.",
    },
    {
        icon: Rocket,
        title: "Go live",
        description: "We launch your site and make sure everything works perfectly.",
    },
]

export function Process1() {
    return (
        <section className="py-24 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
                        How It Works
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Simple process, <span className="text-primary">great results</span>
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="max-w-4xl mx-auto relative">
                    {/* Connecting line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            className={`relative flex items-start gap-8 mb-12 last:mb-0 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                                }`}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Icon */}
                            <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 ${index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"
                                }`}>
                                <step.icon className="w-7 h-7" />
                            </div>

                            {/* Content */}
                            <div className={`flex-1 max-w-md ${index % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}>
                                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-3">
                                    Step {index + 1}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}

                    {/* Final checkmark */}
                    <motion.div
                        className="flex justify-center mt-12"
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <div className="w-20 h-20 rounded-full bg-chart-1 text-background flex items-center justify-center shadow-lg shadow-chart-1/30">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
