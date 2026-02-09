"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
    {
        name: "Simple Website",
        price: "€99",
        description: "Perfect for getting your business online",
        features: [
            "Custom design, not a template",
            "Mobile-friendly & fast",
            "Easy content updates",
            "Hosting included",
            "Security & backups",
        ],
        cta: "Start Here",
        href: "/start-project",
    },
    {
        name: "Advanced Website",
        price: "€299",
        description: "For businesses that need more functionality",
        features: [
            "Everything in Simple",
            "Online store or bookings",
            "Customer accounts",
            "Payment processing",
            "Priority support",
        ],
        cta: "Get Started",
        href: "/start-project",
        popular: true,
    },
    {
        name: "Custom System",
        price: "Custom",
        description: "Tailored solutions for specific needs",
        features: [
            "Everything in Advanced",
            "Built for your workflow",
            "Team collaboration",
            "Advanced integrations",
            "Dedicated manager",
        ],
        cta: "Let's Talk",
        href: "/contact",
    },
]

export function Pricing3() {
    return (
        <section id="pricing" className="py-24 md:py-32 bg-muted/30">
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
                        Simple pricing. No surprises.
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        What you see is what you pay. Every plan includes hosting, support, and updates.
                    </p>
                </motion.div>

                {/* Pricing cards - Horizontal layout */}
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                className={`relative rounded-2xl p-8 ${plan.popular
                                        ? "bg-card border-2 border-primary shadow-lg"
                                        : "bg-card border border-border"
                                    }`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-8">
                                        <span className="px-3 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                                </div>

                                <div className="mb-6">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.price !== "Custom" && (
                                        <span className="text-muted-foreground">/month</span>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-sm">
                                            <Check className="w-4 h-4 text-chart-1 shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full font-semibold group"
                                    variant={plan.popular ? "default" : "outline"}
                                    asChild
                                >
                                    <Link href={plan.href}>
                                        {plan.cta}
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Guarantee */}
                    <motion.div
                        className="mt-12 text-center p-6 rounded-xl bg-chart-1/10 border border-chart-1/20"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <p className="text-lg font-semibold">
                            <span className="text-chart-1">✓</span> No contracts. Cancel anytime.
                            Your site keeps working even if you leave.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
