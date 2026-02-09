"use client"

import { motion } from "framer-motion"
import { Globe, ShoppingBag, Users, Cog, ChevronRight } from "lucide-react"
import Link from "next/link"

const services = [
    {
        icon: Globe,
        number: "01",
        title: "Company Websites",
        description: "Professional sites that showcase your business and help customers find you. Clean design, fast loading, easy to update.",
        benefits: ["Mobile-friendly", "SEO optimized", "Easy content updates"],
    },
    {
        icon: ShoppingBag,
        number: "02",
        title: "Online Stores",
        description: "Sell products directly from your website. Secure payments, inventory management, and customer accounts included.",
        benefits: ["Secure checkout", "Product management", "Order tracking"],
    },
    {
        icon: Users,
        number: "03",
        title: "Customer Portals",
        description: "Give your clients a personal space to manage their accounts, view orders, book appointments, or access exclusive content.",
        benefits: ["User accounts", "Booking systems", "Member areas"],
    },
    {
        icon: Cog,
        number: "04",
        title: "Business Systems",
        description: "Custom internal tools that fit exactly how your team works. From simple dashboards to full management systems.",
        benefits: ["Team collaboration", "Data management", "Custom workflows"],
    },
]

export function Services2() {
    return (
        <section id="services" className="py-24 md:py-32">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header - Left aligned */}
                <motion.div
                    className="max-w-2xl mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                        What can we build for you?
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Whatever your business needs online — from a simple company website to a complex
                        management system — we can make it happen.
                    </p>
                </motion.div>

                {/* Services - Horizontal scroll cards on mobile, stacked on desktop */}
                <div className="space-y-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={service.title}
                            className="group relative"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link href="/services" className="block">
                                <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12 p-8 rounded-3xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-300">
                                    {/* Number */}
                                    <div className="text-6xl md:text-8xl font-bold text-muted/20 group-hover:text-primary/20 transition-colors">
                                        {service.number}
                                    </div>

                                    {/* Icon & Title */}
                                    <div className="flex items-center gap-4 md:min-w-[200px]">
                                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                            <service.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold">{service.title}</h3>
                                    </div>

                                    {/* Description */}
                                    <p className="flex-1 text-muted-foreground leading-relaxed">
                                        {service.description}
                                    </p>

                                    {/* Benefits & Arrow */}
                                    <div className="flex items-center gap-8">
                                        <div className="hidden lg:flex gap-3">
                                            {service.benefits.map((benefit) => (
                                                <span
                                                    key={benefit}
                                                    className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                                                >
                                                    {benefit}
                                                </span>
                                            ))}
                                        </div>
                                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
