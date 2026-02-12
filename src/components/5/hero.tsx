"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { HeroBackground } from "@/components/sections/hero-background"
import { HeroLogoMarquee } from "@/components/sections/logo-cloud"
import { Hero3D } from "./hero-3d"
import { CometCardDemo } from "./CometCardDemo"

export function Hero5() {
    return (
        <section className="relative py-16 md:py-24 overflow-hidden">
            <div className="hidden xl:flex ">
                <HeroBackground />
            </div>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-6 gap-12 lg:gap-16 items-center">
                        {/* Main content - 3 columns */}
                        <div className="lg:col-span-4">
                            {/* Badge */}


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
                                Your website is your hardest-working salesperson. <br />
                                Make sure it&apos;s actually working for you.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Button size="lg" className="h-12 px-4 md:px-8 text-base group" asChild>
                                    <Link href="/start-project">
                                        Start Your Project
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-4 md:px-8 text-base bg-background/50 backdrop-blur-sm"
                                    asChild
                                >
                                    <Link href="/work">Our Work</Link>
                                </Button>
                            </motion.div>
                        </div>

                        <Hero3D />
                        {/* <CometCardDemo /> */}
                    </div>
                </div>

                <motion.div
                    className="mt-16 w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                        Trusted by
                    </p>
                    <HeroLogoMarquee />
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-20 pointer-events-none" />
        </section>
    )
}
