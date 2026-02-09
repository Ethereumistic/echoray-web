"use client"

import { motion } from "framer-motion"

const services = [
    {
        number: "01",
        title: "Brand Websites",
        description: "Elegant digital homes for businesses that value first impressions.",
    },
    {
        number: "02",
        title: "E-Commerce",
        description: "Refined shopping experiences that match your product's quality.",
    },
    {
        number: "03",
        title: "Digital Platforms",
        description: "Custom systems designed around how you actually work.",
    },
]

export function Services4() {
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
                            Services
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">
                            What we create
                        </h2>
                    </motion.div>

                    {/* Services list */}
                    <div className="space-y-0">
                        {services.map((service, index) => (
                            <motion.div
                                key={service.title}
                                className="group border-t border-border py-12 md:py-16"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16">
                                    {/* Number */}
                                    <span className="text-4xl md:text-5xl font-serif text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                                        {service.number}
                                    </span>

                                    {/* Title */}
                                    <h3 className="text-2xl md:text-3xl font-serif flex-1">
                                        {service.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-muted-foreground max-w-sm leading-relaxed">
                                        {service.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                        <div className="border-t border-border" />
                    </div>
                </div>
            </div>
        </section>
    )
}
