"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const CDN_BASE = "https://cdn.jsdelivr.net/gh/Ethereumistic/echoray-cdn/partners/"

const partners = [
    { name: "Alubeta", file: "alubeta" },
    { name: "Bio DDD", file: "bio-ddd" },
    { name: "Chist BG", file: "chist-bg" },
    { name: "DB Prod", file: "db-prod" },
    { name: "Dr11", file: "dr11" },
    { name: "Global Travel", file: "global-travel" },
    { name: "M-Texx", file: "m-texx" },
    { name: "Ultrabuild", file: "ultrabuild" },
    { name: "Yea.cool", file: "yea.cool" },
]

/**
 * LogoCloud - Infinite marquee of partner logos.
 * Uses pure CSS animation for GPU-accelerated, smooth 60fps scrolling.
 * Dark themed only.
 */
export function LogoCloud() {
    // Duplicate logos for seamless loop
    const logos = [...partners, ...partners]

    return (
        <section className="relative w-full overflow-hidden bg-background py-12 md:py-16">
            {/* Header */}
            <div className="container mx-auto px-4 text-center mb-10">
                <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
                    Trusted by
                </p>
            </div>

            {/* Marquee Container */}
            <div
                className="relative flex w-full overflow-hidden"
                aria-label="Partner logos"
            >
                {/* Left fade gradient */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-linear-to-r from-background to-transparent" />

                {/* Marquee track */}
                <div
                    className={cn(
                        "flex w-max animate-marquee items-center gap-16",
                        // Pause on hover for accessibility
                        "hover:paused"
                    )}
                    style={{
                        // CSS custom property for animation duration (slow = 60s)
                        "--marquee-duration": "60s",
                    } as React.CSSProperties}
                >
                    {logos.map((partner, index) => (
                        <div
                            key={`${partner.file}-${index}`}
                            className="flex h-12 w-32 shrink-0 items-center justify-center grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                        >
                            <Image
                                src={`${CDN_BASE}${partner.file}.png`}
                                alt={`${partner.name} logo`}
                                width={128}
                                height={48}
                                className="h-auto max-h-10 w-auto max-w-[120px] object-contain"
                                loading="lazy"
                                unoptimized // CDN images
                            />
                        </div>
                    ))}
                </div>

                {/* Right fade gradient */}
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-linear-to-l from-background to-transparent" />
            </div>
        </section>
    )
}

/**
 * HeroLogoMarquee - Compact logo cloud for embedding in the hero section.
 * Larger logos, constrained width, no header.
 */
export function HeroLogoMarquee() {
    // Duplicate logos for seamless loop
    const logos = [...partners, ...partners]

    return (
        <motion.div
            className="mt-8 w-full"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        >
            <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Trusted by
            </p>
            <div className="relative w-full max-w-none md:max-w-4xl mx-auto overflow-hidden">
                {/* Left fade gradient — hidden on mobile */}
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-linear-to-r from-background to-transparent hidden md:block" />

                {/* Marquee track */}
                <div
                    className={cn(
                        "flex w-max animate-marquee items-center gap-12 md:gap-28",
                        "hover:paused"
                    )}
                    style={{
                        "--marquee-duration": "120s",
                    } as React.CSSProperties}
                    aria-label="Trusted partners"
                >
                    {logos.map((partner, index) => (
                        <div
                            key={`hero-${partner.file}-${index}`}
                            className="flex h-18 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center grayscale opacity-50 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
                        >
                            <Image
                                src={`${CDN_BASE}${partner.file}.png`}
                                alt={`${partner.name} logo`}
                                width={160}
                                height={64}
                                className="h-auto max-h-24 w-auto max-w-[150px] object-contain"
                                loading="eager"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>

                {/* Right fade gradient — hidden on mobile */}
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-linear-to-l from-background to-transparent hidden md:block" />
            </div>
        </motion.div>
    )
}
