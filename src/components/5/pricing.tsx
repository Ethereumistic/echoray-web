"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowRight, Star, X, Sparkles, Crown, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const planIcons = {
    "Simple Website": Zap,
    "Advanced Website": Star,
    "Custom System": Crown,
}

const plans = [
    {
        name: "Simple Website",
        price: "€99",
        setup: "€0 setup",
        description: "Get online and start growing",
        bestFor: "Perfect for: Personal brands, freelancers, local businesses",
        features: [
            { text: "Beautiful custom design", included: true },
            { text: "Mobile-responsive", included: true },
            { text: "Easy content updates", included: true },
            { text: "Hosting & SSL included", included: true },
            { text: "Email support", included: true },
            { text: "Online store", included: false },
            { text: "User accounts", included: false },
        ],
        cta: "Start for €99/month",
        href: "/start-project",
    },
    {
        name: "Advanced Website",
        price: "€299",
        setup: "€0 setup",
        description: "Sell online and grow faster",
        bestFor: "Perfect for: E-commerce, service businesses, growing companies",
        popular: true,
        features: [
            { text: "Everything in Simple", included: true },
            { text: "Online store with payments", included: true },
            { text: "Customer accounts", included: true },
            { text: "Booking/appointment system", included: true },
            { text: "Priority support", included: true },
            { text: "Advanced integrations", included: true },
            { text: "Custom automations", included: false },
        ],
        cta: "Start for €299/month",
        href: "/start-project",
    },
    {
        name: "Custom System",
        price: "Custom",
        setup: "Quoted per project",
        description: "Built exactly for your needs",
        bestFor: "Perfect for: Complex workflows, large teams, unique requirements",
        features: [
            { text: "Everything in Advanced", included: true },
            { text: "Custom development", included: true },
            { text: "CRM & dashboards", included: true },
            { text: "Team collaboration", included: true },
            { text: "API integrations", included: true },
            { text: "Dedicated support", included: true },
            { text: "SLA agreement", included: true },
        ],
        cta: "Get a Quote",
        href: "/contact",
    },
]

export function Pricing5() {
    return (
        <section id="pricing" className="py-16">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        Choose your plan
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        No hidden fees. No contracts. Cancel anytime.
                    </p>
                </motion.div>

                {/* Pricing comparison */}
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            className={`relative rounded-2xl p-6 md:p-8 ${plan.popular
                                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                                : "bg-card border border-border"
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-background text-sm font-bold rounded-full">
                                        <Star className="w-3 h-3" />
                                        Best Value
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-lg font-bold mb-1 ${plan.popular ? "" : "text-foreground"}`}>
                                    {plan.name}
                                </h3>
                                <p className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.price !== "Custom" && (
                                        <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                            /month
                                        </span>
                                    )}
                                </div>
                                <p className={`text-sm mt-1 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                    {plan.setup}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature.text}
                                        className={`flex items-center gap-2 text-sm ${!feature.included
                                            ? plan.popular
                                                ? "text-primary-foreground/40"
                                                : "text-muted-foreground/50"
                                            : ""
                                            }`}
                                    >
                                        {feature.included ? (
                                            <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-chart-1" : "text-chart-1"}`} />
                                        ) : (
                                            <X className={`w-4 h-4 shrink-0 ${plan.popular ? "text-primary-foreground/30" : "text-destructive/50"}`} />
                                        )}
                                        <span className={!feature.included ? "line-through" : ""}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <p className={`text-xs mb-6 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                                {plan.bestFor}
                            </p>

                            <Button
                                className={`w-full font-semibold group ${plan.popular
                                    ? "bg-background text-foreground hover:bg-background/90"
                                    : ""
                                    }`}
                                variant={plan.popular ? "secondary" : "default"}
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

                {/* One-time option */}
                <motion.div
                    className="max-w-3xl mx-auto mt-12 p-6 rounded-2xl bg-muted/50 border border-border text-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <p className="font-semibold mb-2">Prefer to own your website outright?</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        We also offer one-time payment options with no monthly fees.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/contact">Learn More</Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
