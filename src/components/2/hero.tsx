"use client"

import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowDown, Sparkles } from "lucide-react"
import { useRef } from "react"

export function Hero2() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    })

    const y = useTransform(scrollYProgress, [0, 1], [0, 200])
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

    return (
        <section ref={containerRef} className="relative min-h-[100vh] flex flex-col overflow-hidden">
            {/* Split background */}
            <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2">
                <div className="bg-background" />
                <div className="hidden lg:block bg-gradient-to-br from-primary to-primary/80" />
            </div>

            {/* Content */}
            <motion.div
                className="container relative z-10 mx-auto px-4 md:px-6 flex-1 flex items-center py-20"
                style={{ y, opacity }}
            >
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full">
                    {/* Left side - Text */}
                    <div className="order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="inline-flex items-center gap-2 text-primary font-semibold mb-6">
                                <Sparkles className="w-4 h-4" />
                                Web Development Studio
                            </span>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                                Your business deserves a website that{" "}
                                <span className="relative">
                                    <span className="text-primary">works</span>
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="3" fill="none" className="text-primary/40" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-lg">
                                Not just pretty to look at — but designed to turn visitors into customers.
                                We build digital experiences that make your business grow.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="h-14 px-8 text-lg font-semibold" asChild>
                                    <Link href="/start-project">Start Building</Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-14 px-8 text-lg font-semibold"
                                    asChild
                                >
                                    <Link href="#services">See What We Do</Link>
                                </Button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right side - Feature cards */}
                    <div className="order-1 lg:order-2 relative">
                        <motion.div
                            className="space-y-4"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            {[
                                { title: "Simple websites", desc: "For personal brands & small businesses" },
                                { title: "Online stores", desc: "Sell your products worldwide" },
                                { title: "Custom systems", desc: "Built for how your team works" },
                            ].map((item, index) => (
                                <motion.div
                                    key={item.title}
                                    className="p-6 rounded-2xl bg-background lg:bg-primary-foreground border border-border lg:border-primary-foreground/20 shadow-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                                >
                                    <h3 className="font-bold text-lg lg:text-primary">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground lg:text-primary/70 mt-1">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
            >
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="p-2 rounded-full bg-muted/80 backdrop-blur-sm"
                >
                    <ArrowDown className="w-5 h-5 text-muted-foreground" />
                </motion.div>
            </motion.div>
        </section>
    )
}
