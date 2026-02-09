"use client"

import { motion } from "framer-motion"
import { Globe, ShoppingBag, Users, Building2, ArrowUpRight } from "lucide-react"

const services = [
    {
        icon: Globe,
        title: "Company Websites",
        description: "Professional online presence that builds trust and attracts customers to your business.",
        color: "from-blue-500/20 to-blue-600/5",
    },
    {
        icon: ShoppingBag,
        title: "Online Stores",
        description: "Sell your products online with a beautiful, easy-to-manage storefront.",
        color: "from-emerald-500/20 to-emerald-600/5",
    },
    {
        icon: Users,
        title: "Customer Portals",
        description: "Give your clients their own login area to manage accounts, bookings, and more.",
        color: "from-violet-500/20 to-violet-600/5",
    },
    {
        icon: Building2,
        title: "Business Systems",
        description: "Custom tools tailored to how your team actually works, from CRMs to internal dashboards.",
        color: "from-amber-500/20 to-amber-600/5",
    },
]

export function Services1() {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="max-w-3xl mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
                        What We Build
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        From simple websites to{" "}
                        <span className="text-primary">complete digital systems</span>
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Whatever your business needs online, we can build it.
                        Clean, fast, and designed to help you grow.
                    </p>
                </motion.div>

                {/* Services grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${service.color} border border-border/50 p-8 md:p-10 transition-all duration-300 hover:border-primary/30 hover:shadow-xl`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Icon */}
                            <div className="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary">
                                <service.icon className="w-8 h-8" />
                            </div>

                            {/* Content */}
                            <h3 className="text-2xl font-bold mb-3 flex items-center gap-2">
                                {service.title}
                                <ArrowUpRight className="w-5 h-5 opacity-0 -translate-x-2 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 text-primary" />
                            </h3>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {service.description}
                            </p>

                            {/* Decorative element */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-150 group-hover:bg-primary/10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
