"use client"

import { motion } from "framer-motion"
import { MessageCircle, Palette, Code, Rocket } from "lucide-react"

const steps = [
    {
        icon: MessageCircle,
        title: "1. Quick chat",
        duration: "15 min",
        description: "Tell us about your business. We'll figure out exactly what you need.",
    },
    {
        icon: Palette,
        title: "2. We design",
        duration: "3-5 days",
        description: "You'll see your website design before we build anything.",
    },
    {
        icon: Code,
        title: "3. We build",
        duration: "5-7 days",
        description: "We create your site while you focus on running your business.",
    },
    {
        icon: Rocket,
        title: "4. You launch",
        duration: "Day 7+",
        description: "Your new website goes live. Start getting more customers.",
    },
]

export function Process5() {
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
                        Live in 7 days
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Here&apos;s exactly how it works
                    </p>
                </motion.div>

                {/* Process steps */}
                <div className="max-w-4xl mx-auto">
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                className="text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                {/* Icon */}
                                <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4">
                                    <step.icon className="w-8 h-8" />
                                </div>

                                {/* Duration badge */}
                                <div className="mb-2">
                                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-chart-1/10 text-chart-1 rounded-full">
                                        {step.duration}
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="font-bold mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Connector line (desktop) */}
                    <div className="hidden md:block relative h-1 bg-border rounded-full mt-8 max-w-3xl mx-auto">
                        <motion.div
                            className="absolute inset-y-0 left-0 bg-primary rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
