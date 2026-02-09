"use client"

import { motion } from "framer-motion"

const steps = [
    {
        step: "1",
        title: "We talk",
        description: "A quick conversation to understand what you need. No technical jargon, just plain talk about your goals.",
    },
    {
        step: "2",
        title: "We plan",
        description: "We create a clear roadmap for your project and recommend the best approach for your budget.",
    },
    {
        step: "3",
        title: "We build",
        description: "Our team gets to work. You'll see progress along the way and can give feedback anytime.",
    },
    {
        step: "4",
        title: "You launch",
        description: "Your new website goes live. We make sure everything works perfectly and you know how to use it.",
    },
]

export function Process2() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Header */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            From idea to launch,{" "}
                            <span className="text-primary">step by step</span>
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We keep the process simple so you can focus on running your business.
                            Here&apos;s how working with us looks.
                        </p>
                    </motion.div>

                    {/* Right - Steps */}
                    <div className="space-y-8">
                        {steps.map((item, index) => (
                            <motion.div
                                key={item.step}
                                className="flex gap-6"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                {/* Step number */}
                                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                                    {item.step}
                                </div>

                                {/* Content */}
                                <div className="pt-2">
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
