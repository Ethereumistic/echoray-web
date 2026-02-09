"use client"

import { motion } from "framer-motion"
import { Shield, Clock, HeadphonesIcon, RefreshCcw, Zap, Heart } from "lucide-react"

const features = [
    {
        icon: Shield,
        title: "Secure & Reliable",
        description: "Your website runs on modern, secure infrastructure.",
    },
    {
        icon: Clock,
        title: "Always Online",
        description: "99.9% uptime guarantee keeps you open for business.",
    },
    {
        icon: HeadphonesIcon,
        title: "Human Support",
        description: "Real people ready to help when you need it.",
    },
    {
        icon: RefreshCcw,
        title: "Regular Updates",
        description: "We keep everything running smoothly behind the scenes.",
    },
    {
        icon: Zap,
        title: "Lightning Fast",
        description: "Optimized for speed so visitors never wait.",
    },
    {
        icon: Heart,
        title: "Built With Care",
        description: "Every detail crafted with your success in mind.",
    },
]

export function Features1() {
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
                    <p className="text-primary font-semibold uppercase tracking-wider text-sm mb-4">
                        What You Get
                    </p>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Everything you need, <span className="text-primary">included</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        No hidden extras. Every plan comes with the essentials to keep your site running perfectly.
                    </p>
                </motion.div>

                {/* Features grid */}
                <div className="max-w-5xl mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="text-center group"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                        >
                            <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20">
                                <feature.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
