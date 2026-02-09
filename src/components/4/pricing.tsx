"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
    {
        name: "Essential",
        price: "€99",
        period: "per month",
        description: "For businesses ready to establish a refined online presence.",
        features: [
            "Bespoke design",
            "Responsive across all devices",
            "Content management",
            "Hosting & security",
        ],
        cta: "Select Plan",
        href: "/start-project",
    },
    {
        name: "Professional",
        price: "€299",
        period: "per month",
        description: "For growing businesses requiring advanced functionality.",
        features: [
            "Everything in Essential",
            "E-commerce capabilities",
            "User authentication",
            "Payment integration",
            "Priority support",
        ],
        cta: "Select Plan",
        href: "/start-project",
        featured: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "tailored",
        description: "For organizations with complex requirements.",
        features: [
            "Everything in Professional",
            "Custom development",
            "System integrations",
            "Dedicated support",
            "SLA agreement",
        ],
        cta: "Discuss Requirements",
        href: "/contact",
    },
]

export function Pricing4() {
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
                            Investment
                        </span>
                        <h2 className="text-4xl md:text-5xl font-serif tracking-tight mb-6">
                            Transparent pricing
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            No hidden costs. No surprises. Just quality work at fair rates.
                        </p>
                    </motion.div>

                    {/* Pricing cards */}
                    <div className="grid md:grid-cols-3 gap-8 md:gap-4">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                className={`relative p-8 md:p-10 rounded-sm ${plan.featured
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card border border-border"
                                    }`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                {/* Plan name */}
                                <span className={`text-sm font-medium tracking-[0.2em] uppercase ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}>
                                    {plan.name}
                                </span>

                                {/* Price */}
                                <div className="mt-6 mb-2">
                                    <span className="text-4xl font-serif">{plan.price}</span>
                                </div>
                                <p className={`text-sm ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {plan.period}
                                </p>

                                {/* Description */}
                                <p className={`mt-6 text-sm leading-relaxed ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                                    }`}>
                                    {plan.description}
                                </p>

                                {/* Features */}
                                <ul className="mt-8 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm">
                                            <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.featured ? "text-chart-1" : "text-primary"
                                                }`} />
                                            <span className={plan.featured ? "text-primary-foreground/90" : ""}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Button
                                    className={`w-full mt-10 font-medium ${plan.featured
                                            ? "bg-background text-foreground hover:bg-background/90"
                                            : ""
                                        }`}
                                    variant={plan.featured ? "secondary" : "default"}
                                    asChild
                                >
                                    <Link href={plan.href}>{plan.cta}</Link>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* One-time note */}
                    <motion.p
                        className="text-center text-muted-foreground mt-16"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        One-time project pricing also available upon request.
                    </motion.p>
                </div>
            </div>
        </section>
    )
}
