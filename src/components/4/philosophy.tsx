"use client"

import { motion } from "framer-motion"

const values = [
    {
        title: "Crafted, not mass-produced",
        description: "Every website we build is designed from scratch for your specific needs. No templates, no shortcuts.",
    },
    {
        title: "Partnership, not transaction",
        description: "We become an extension of your team, invested in your success long after launch.",
    },
    {
        title: "Clarity, not confusion",
        description: "We speak your language, not tech jargon. You'll always know exactly what's happening.",
    },
]

export function Philosophy4() {
    return (
        <section className="py-32 md:py-40">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-24"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-sm font-medium tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                            Our Philosophy
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
                            Excellence in every detail
                        </h2>
                    </motion.div>

                    {/* Values */}
                    <div className="grid md:grid-cols-3 gap-12 md:gap-16">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                className="text-center"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <div className="w-16 h-px bg-primary mx-auto mb-8" />
                                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
