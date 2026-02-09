"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const plans = [
    {
        id: "simple",
        name: "Simple Website",
        price: "€99",
        period: "/month",
        description: "For personal brands, portfolios, and small businesses that need a professional online presence.",
        features: [
            "Professional design tailored to your brand",
            "Works perfectly on all devices",
            "Easy-to-use content manager",
            "Hosting and security included",
            "Email support",
        ],
        cta: "Get Started",
        href: "/start-project",
    },
    {
        id: "advanced",
        name: "Advanced Website",
        price: "€299",
        period: "/month",
        description: "For growing businesses that need e-commerce, user accounts, or booking systems.",
        features: [
            "Everything in Simple Website",
            "Online store with payments",
            "Customer account system",
            "Booking or appointment features",
            "Priority support",
        ],
        cta: "Get Started",
        href: "/start-project",
        popular: true,
    },
    {
        id: "custom",
        name: "Custom System",
        price: "Custom",
        period: "pricing",
        description: "For businesses that need fully custom solutions built around their unique workflows.",
        features: [
            "Everything in Advanced",
            "Custom-built for your needs",
            "Advanced integrations",
            "Team collaboration tools",
            "Dedicated account manager",
        ],
        cta: "Let's Talk",
        href: "/contact",
    },
]

export function Pricing2() {
    const [hoveredPlan, setHoveredPlan] = useState<string | null>("advanced")

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
                        Honest pricing for every stage
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Start with what you need today. Upgrade seamlessly as your business grows.
                    </p>
                </motion.div>

                {/* Pricing toggle/cards */}
                <div className="max-w-5xl mx-auto">
                    {/* Tabs */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {plans.map((plan) => (
                            <button
                                key={plan.id}
                                onClick={() => setHoveredPlan(plan.id)}
                                className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all ${hoveredPlan === plan.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-background border border-border hover:border-primary/50"
                                    }`}
                            >
                                {plan.name}
                                {plan.popular && (
                                    <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold bg-chart-1 text-background rounded-full">
                                        Popular
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Selected plan detail */}
                    {plans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: hoveredPlan === plan.id ? 1 : 0,
                                y: hoveredPlan === plan.id ? 0 : 20,
                                display: hoveredPlan === plan.id ? "block" : "none"
                            }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-card rounded-3xl border border-border p-8 md:p-12 shadow-xl">
                                <div className="grid md:grid-cols-2 gap-12">
                                    {/* Left - Info */}
                                    <div>
                                        <div className="flex items-baseline gap-2 mb-4">
                                            <span className="text-5xl md:text-6xl font-bold">{plan.price}</span>
                                            <span className="text-xl text-muted-foreground">{plan.period}</span>
                                        </div>
                                        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                                            {plan.description}
                                        </p>
                                        <Button size="lg" className="h-14 px-8 text-lg font-semibold group" asChild>
                                            <Link href={plan.href}>
                                                {plan.cta}
                                                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            </Link>
                                        </Button>
                                    </div>

                                    {/* Right - Features */}
                                    <div>
                                        <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
                                            What&apos;s included
                                        </h4>
                                        <ul className="space-y-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-chart-1 shrink-0 mt-0.5" />
                                                    <span className="text-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* One-time option */}
                <motion.div
                    className="max-w-2xl mx-auto mt-12 text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <p className="text-muted-foreground mb-4">
                        Prefer a one-time payment? We offer that too.
                    </p>
                    <Button variant="link" className="text-primary font-semibold" asChild>
                        <Link href="/contact">Learn about one-time projects →</Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
