"use client"

import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { MessageCircle, Palette, Code, Rocket, Clock, CheckCircle2, Play, type LucideIcon } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"

interface ProcessStep {
    icon: LucideIcon
    title: string
    duration: string
    description: string
    longDescription: string
    videoUrl?: string
    videoPosition: "left" | "right"
    accentColor: string
}

const steps: ProcessStep[] = [
    {
        icon: MessageCircle,
        title: "Strategy Session",
        duration: "15 min",
        description: "A deep dive into your business goals and vision.",
        longDescription: "We start with a high-impact strategy session. No fluff—just real talk about your brand, your audience, and the conversion goals that matter most to your bottom line.",
        videoPosition: "right",
        accentColor: "hsl(var(--primary))",
    },
    {
        icon: Palette,
        title: "Visual Blueprint",
        duration: "3-5 days",
        description: "Prototyping your success in high-fidelity.",
        longDescription: "Our designers craft a bespoke visual identity for your web solution. You'll see every interaction, every detail, and every flow in Figma before we write a single line of code.",
        videoPosition: "left",
        accentColor: "hsl(var(--chart-1))",
    },
    {
        icon: Code,
        title: "High-Octane Build",
        duration: "5-7 days",
        description: "Turning pixels into performance-first reality.",
        longDescription: "Using a cutting-edge stack (Next.js, Framer Motion, Tailwind), we build a lightning-fast experience. Optimized for SEO, accessibility, and most importantly, conversion.",
        videoPosition: "right",
        accentColor: "hsl(var(--chart-2))",
    },
    {
        icon: Rocket,
        title: "Global Launch",
        duration: "Day 7+",
        description: "Your digital storefront goes live to the world.",
        longDescription: "Deployment handled. DNS optimized. SSL secured. We don't just 'launch'—we ensure your site is a high-performance asset from second one, ready to scale with your business.",
        videoPosition: "left",
        accentColor: "hsl(var(--primary))",
    },
]

function StepContent({ step, index, isActive }: { step: ProcessStep; index: number; isActive: boolean }) {
    const isVideoLeft = step.videoPosition === "left"

    return (
        <div className="container mx-auto px-6 max-w-7xl h-full flex items-center">
            <div className={`grid lg:grid-cols-2 gap-12 lg:gap-24 items-center w-full ${isVideoLeft ? 'lg:flex-row-reverse' : ''}`}>

                {/* Text Side */}
                <motion.div
                    className={`space-y-8 ${isVideoLeft ? 'lg:order-2' : 'lg:order-1'}`}
                    initial={{ opacity: 0, x: isVideoLeft ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ margin: "-20%" }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                >
                    <div className="space-y-4">
                        <Badge className="px-4 py-1.5 bg-primary/10 text-primary border-primary/20 text-sm font-bold tracking-widest uppercase">
                            Phase 0{index + 1}
                        </Badge>
                        <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">
                            {step.title.split(' ').map((word, i) => (
                                <span key={i} className="block">{word}</span>
                            ))}
                        </h2>
                    </div>

                    <div className="space-y-6 max-w-md">
                        <div className="flex items-center gap-3 text-primary font-bold bg-primary/5 w-fit px-4 py-2 rounded-lg border border-primary/10">
                            <Clock className="w-5 h-5 text-primary" />
                            <span>Timeline: {step.duration}</span>
                        </div>
                        <p className="text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed">
                            {step.longDescription}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-4">
                        {["Bespoke Strategy", "Performance Focused", "Scalable UI"].map((tag) => (
                            <div key={tag} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {tag}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Video/Visual Side */}
                <motion.div
                    className={`relative aspect-[9/16] group ${isVideoLeft ? 'lg:order-1' : 'lg:order-2'}`}
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ margin: "-20%" }}
                    transition={{ duration: 1, ease: "circOut" }}
                >
                    {/* Shadow Decor */}
                    <div className="absolute -inset-4 bg-primary/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />

                    <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-[12px] border-card bg-muted shadow-2xl relative">
                        {step.videoUrl ? (
                            <video
                                src={step.videoUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center space-y-4 bg-gradient-to-b from-card to-muted">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <step.icon className="w-10 h-10 text-primary" />
                                </div>
                                <h4 className="text-xl font-bold uppercase tracking-tighter">Demonstration Pending</h4>
                                <p className="text-sm text-muted-foreground">Video visualization for {step.title} will be rendered here.</p>
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                                    <Play className="w-12 h-12 text-primary/20 animate-pulse fill-primary/10" />
                                </div>
                            </div>
                        )}

                        {/* Glass Overlay for Phase Number */}
                        <div className="absolute top-8 left-8">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center font-black text-xl text-white">
                                0{index + 1}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

interface Process5Props {
    videoUrls?: {
        strategy?: string
        design?: string
        build?: string
        launch?: string
    }
}

export function Process5({ videoUrls = {} }: Process5Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const [activeIndex, setActiveIndex] = useState(0)
    const totalSteps = steps.length

    // Smooth transform for background or progression indicators if needed
    // const backgroundOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0])

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const index = Math.min(
                Math.floor(latest * totalSteps),
                totalSteps - 1
            )
            setActiveIndex(index)
        })
        return unsubscribe
    }, [scrollYProgress, totalSteps])

    // Update steps with URLs
    const enrichedSteps = steps.map((step, i) => {
        const urls = [videoUrls.strategy, videoUrls.design, videoUrls.build, videoUrls.launch]
        return { ...step, videoUrl: urls[i] }
    })

    return (
        <div ref={containerRef} className="relative bg-background" style={{ height: `${steps.length * 100}vh` }}>
            {/* Background Decor */}
            <div className="sticky top-0 h-screen w-full pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] transition-colors duration-1000" />
            </div>

            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* Transitioning Content */}
                <div className="h-full w-full relative">
                    {enrichedSteps.map((step, index) => (
                        <motion.div
                            key={step.title}
                            className="absolute inset-0 w-full h-full"
                            initial={false}
                            animate={{
                                opacity: activeIndex === index ? 1 : 0,
                                zIndex: activeIndex === index ? 10 : 0,
                                pointerEvents: activeIndex === index ? 'all' : 'none',
                                y: activeIndex === index ? 0 : (activeIndex > index ? -50 : 50)
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                                opacity: { duration: 0.4 }
                            }}
                        >
                            <StepContent
                                step={step}
                                index={index}
                                isActive={activeIndex === index}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Vertical Progress Indicator */}
                <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-8 z-50">
                    {steps.map((_, i) => (
                        <div key={i} className="relative flex items-center justify-end">
                            <motion.span
                                className="absolute right-12 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap"
                                animate={{
                                    opacity: activeIndex === i ? 1 : 0,
                                    x: activeIndex === i ? 0 : 20
                                }}
                            >
                                Stage 0{i + 1}
                            </motion.span>
                            <motion.div
                                className={`w-3 h-3 rounded-full transition-all duration-500 border-2 ${i === activeIndex ? 'bg-primary border-primary scale-150 shadow-[0_0_20px_rgba(var(--primary),0.5)]' : 'bg-transparent border-muted-foreground/30'
                                    }`}
                            />
                        </div>
                    ))}
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 opacity-30">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scroll</span>
                    <div className="w-1 h-12 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            className="w-full bg-primary origin-top"
                            style={{ height: "100%", scaleY: scrollYProgress }}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
