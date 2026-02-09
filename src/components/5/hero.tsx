"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calculator, TrendingUp, Clock } from "lucide-react"

const valueProps = [
    { icon: Calculator, text: "From €99/month — less than a coffee a day" },
    { icon: TrendingUp, text: "Average 40% increase in online inquiries" },
    { icon: Clock, text: "Live in 7 days, not 7 months" },
]

export function Hero5() {
    return (
        <section className="py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                        {/* Main content - 3 columns */}
                        <div className="lg:col-span-3">
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="mb-6"
                            >
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-chart-1/10 text-chart-1 rounded-full text-sm font-semibold">
                                    <span className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                                    Get more customers with a better website
                                </span>
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                A professional website
                                <br />
                                <span className="text-primary">that pays for itself</span>
                            </motion.h1>

                            {/* Subheadline */}
                            <motion.p
                                className="text-xl text-muted-foreground mb-8 leading-relaxed"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                Your website is your hardest-working salesperson.
                                Make sure it&apos;s actually working for you.
                            </motion.p>

                            {/* Value props */}
                            <motion.div
                                className="space-y-3 mb-10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                {valueProps.map((prop, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <prop.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">{prop.text}</span>
                                    </div>
                                ))}
                            </motion.div>

                            {/* CTAs */}
                            <motion.div
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <Button size="lg" className="h-14 px-8 text-lg font-semibold group" asChild>
                                    <Link href="/start-project">
                                        Get Started Today
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-8 text-lg font-semibold"
                                    asChild
                                >
                                    <Link href="#pricing">See Pricing</Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Quick price card - 2 columns */}
                        <motion.div
                            className="lg:col-span-2"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                                {/* Background Image */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={{
                                        backgroundImage: `url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800&q=80')`,
                                    }}
                                />
                                {/* Dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60" />

                                {/* Subtle animated glow */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-chart-1/20 to-primary/20 blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

                                {/* Content */}
                                <div className="relative z-10 p-8">
                                    {/* Badge */}
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                        <span className="w-2 h-2 bg-chart-1 rounded-full animate-pulse" />
                                        <p className="text-xs font-semibold text-chart-1 uppercase tracking-wider">
                                            Most Popular
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-5xl font-bold text-white drop-shadow-lg">€99</span>
                                        <span className="text-white/60">/month</span>
                                    </div>

                                    {/* Tagline */}
                                    <p className="text-sm text-white/70 mb-6 leading-relaxed">
                                        Everything you need to get online and start attracting customers.
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-3 text-sm mb-8">
                                        <li className="flex items-center gap-3">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-1/20 text-chart-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="text-white/90">Custom design (not a template)</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-1/20 text-chart-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="text-white/90">Hosting & security included</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chart-1/20 text-chart-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                            <span className="text-white/90">Ready in ~7 days</span>
                                        </li>
                                    </ul>

                                    {/* CTA Button */}
                                    <Button className="w-full h-12 text-base font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl" asChild>
                                        <Link href="/start-project">Start Now</Link>
                                    </Button>

                                    {/* Trust indicator */}
                                    <p className="text-center text-xs text-white/40 mt-4">
                                        No commitment • Cancel anytime
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    )
}
