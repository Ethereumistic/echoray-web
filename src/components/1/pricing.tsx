"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const plans = [
    {
        name: "Simple Website",
        price: "€99",
        description: "For personal brands and small businesses that need to be found online.",
        features: [
            "Professional design tailored to you",
            "Works on all devices",
            "Easy content updates",
            "Hosting included",
        ],
        cta: "Get Started",
        href: "/start-project",
    },
    {
        name: "Advanced Website",
        price: "€299",
        description: "For growing businesses that need more than just a website.",
        features: [
            "Everything in Simple Website",
            "Online store capabilities",
            "Customer accounts & logins",
            "Booking & payment systems",
        ],
        cta: "Get Started",
        href: "/start-project",
        popular: true,
    },
    {
        name: "Custom System",
        price: "Custom",
        description: "For businesses with unique workflows that need tailored solutions.",
        features: [
            "Everything in Advanced",
            "Custom-built for your needs",
            "Team collaboration tools",
            "Dedicated support",
        ],
        cta: "Book a Call",
        href: "/contact",
    },
]

export function Pricing1() {
    return (
        <section className="py-24 md:py-32 bg-gradient-to-b from-background to-muted/30">
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
                        Clear Pricing. <span className="text-primary">Real Value.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        No hidden fees, no surprises. Pick what fits your business today, upgrade when you need more.
                    </p>
                </motion.div>

                {/* Pricing cards */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            className={`relative rounded-3xl p-8 transition-all duration-300 ${plan.popular
                                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-105 md:scale-110 z-10"
                                    : "bg-card border border-border hover:border-primary/50 hover:shadow-lg"
                                }`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-chart-1 text-background text-sm font-bold">
                                        <Sparkles className="w-4 h-4" />
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? "" : "text-foreground"}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold">{plan.price}</span>
                                    {plan.price !== "Custom" && (
                                        <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                            /month
                                        </span>
                                    )}
                                </div>
                                <p className={`mt-4 text-sm leading-relaxed ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className={`w-5 h-5 shrink-0 mt-0.5 ${plan.popular ? "text-chart-1" : "text-primary"}`} />
                                        <span className={`text-sm ${plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-12 font-semibold group ${plan.popular
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

                {/* One-time payment option */}
                <motion.div
                    className="max-w-3xl mx-auto mt-16 p-8 rounded-2xl bg-card border border-border text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h3 className="text-xl font-bold mb-2">Prefer to pay once?</h3>
                    <p className="text-muted-foreground mb-4">
                        Get a complete website with a single payment. Perfect if you want ownership without monthly fees.
                    </p>
                    <Button variant="outline" asChild>
                        <Link href="/contact">Discuss One-Time Payment</Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    )
}
