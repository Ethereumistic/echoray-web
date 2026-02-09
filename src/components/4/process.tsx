"use client"

import { motion } from "framer-motion"

const steps = [
    {
        title: "Consultation",
        description: "We begin with a conversation to understand your vision, goals, and requirements.",
    },
    {
        title: "Strategy",
        description: "We develop a clear plan outlining the approach, timeline, and deliverables.",
    },
    {
        title: "Design",
        description: "We create thoughtful designs that reflect your brand and resonate with your audience.",
    },
    {
        title: "Development",
        description: "We build your website with meticulous attention to quality and performance.",
    },
    {
        title: "Launch",
        description: "We deploy your site and ensure everything functions flawlessly.",
    },
    {
        title: "Support",
        description: "We remain available for ongoing maintenance, updates, and improvements.",
    },
]

export function Process4() {
    return (
        <section className="py-32 md:py-40 bg-muted/20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-24"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                            Process
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
                            How we work
                        </h2>
                    </motion.div>

                    {/* Process steps */}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-12 md:gap-16">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <span className="text-5xl font-serif text-muted-foreground/20">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="text-lg font-semibold mt-4 mb-3">{step.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
