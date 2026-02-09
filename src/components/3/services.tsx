"use client"

import { motion } from "framer-motion"
import { Globe, ShoppingBag, Users, Database } from "lucide-react"

const services = [
    {
        icon: Globe,
        title: "Websites",
        examples: "Business sites, portfolios, landing pages",
    },
    {
        icon: ShoppingBag,
        title: "E-commerce",
        examples: "Online stores, product catalogs",
    },
    {
        icon: Users,
        title: "Portals",
        examples: "Customer logins, member areas",
    },
    {
        icon: Database,
        title: "Systems",
        examples: "CRMs, dashboards, internal tools",
    },
]

export function Services3() {
    return (
        <section className="py-24 md:py-32 bg-muted/30">
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
                        What we build
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-xl mx-auto">
                        From simple websites to complex systems — all custom-built for your needs.
                    </p>
                </motion.div>

                {/* Services icons */}
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            className="text-center"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className="inline-flex p-5 rounded-2xl bg-primary/10 text-primary mb-4">
                                <service.icon className="w-10 h-10" />
                            </div>
                            <h3 className="text-lg font-bold mb-1">{service.title}</h3>
                            <p className="text-sm text-muted-foreground">{service.examples}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
