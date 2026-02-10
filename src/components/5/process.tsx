"use client"

import { motion, useInView } from "framer-motion"
import { MessageCircle, Palette, Code, Rocket, CheckCircle, type LucideIcon, Sparkles, Layers } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

interface ProcessStep {
    icon: LucideIcon
    title: string
    duration: string
    description: string
    badge: string
    component: React.ComponentType<{ isActive: boolean }>
}

// Chat Animation - COMMENTED OUT FOR VIDEO VERSION
/*
function DiscoveryCallAnimation({ isActive }: { isActive: boolean }) {
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])

    const conversation = [
        { text: "What does your business do?", isUser: false },
        { text: "I run a local bakery 🥐", isUser: true },
        { text: "Who are your ideal customers?", isUser: false },
        { text: "Busy parents who want fresh bread", isUser: true },
        { text: "Perfect! I know exactly what you need ✨", isUser: false },
    ]

    useEffect(() => {
        if (!isActive) {
            setMessages([])
            return
        }

        const timeouts: NodeJS.Timeout[] = []
        conversation.forEach((msg, i) => {
            const timeout = setTimeout(() => {
                setMessages(prev => [...prev, msg])
            }, 400 + i * 550)
            timeouts.push(timeout)
        })

        return () => timeouts.forEach(clearTimeout)
    }, [isActive])

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card shadow-2xl border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 px-5 py-4 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground">Quick Discovery Call</p>
                        <p className="text-xs text-muted-foreground">15 minutes • No obligation</p>
                    </div>
                </div>

                <div className="p-4 space-y-3 min-h-[220px]">
                    <AnimatePresence>
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${msg.isUser
                                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                                    : 'bg-muted text-foreground rounded-bl-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
*/

// Video Animation
function DiscoveryCallAnimation({ isActive }: { isActive: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        if (videoRef.current) {
            if (isActive) {
                videoRef.current.play().catch(() => {
                    // Autoplay blocked, user can click to play
                })
            } else {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
            }
        }
    }, [isActive])

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card shadow-2xl border rounded-2xl overflow-hidden">
                <div className="bg-primary/10 px-5 py-4 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-foreground">Quick Discovery Call</p>
                        <p className="text-xs text-muted-foreground">15 minutes • No obligation</p>
                    </div>
                </div>

                <div className="p-1">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="metadata"
                        >
                            <source
                                src="https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/process/meeting.mp4"
                                type="video/mp4"
                            />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Design Preview Animation
function DesignPreviewAnimation({ isActive }: { isActive: boolean }) {
    const plugin = useRef(
        Autoplay({ delay: 3000, stopOnInteraction: false })
    )

    const images = [
        "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/og-image/m-texx.com-en.png",
        "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/og-image/ultrabuild.bg-en.png",
        "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/og-image/global-travel.bg-en.png",
        "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/og-image/dbproductions.net-en.png",
        "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/og-image/danirusev.com-en.png",
    ]

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card shadow-2xl border rounded-2xl overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                        <div className="bg-background rounded-md px-3 py-1 text-xs text-muted-foreground">
                            yourbusiness.com
                        </div>
                    </div>
                </div>

                <Carousel
                    plugins={[plugin.current]}
                    className="w-full"
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                >
                    <CarouselContent>
                        {images.map((src, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-b-md">
                                    <img
                                        src={src}
                                        alt={`Design preview ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                {/*
                <div className="p-6 min-h-[220px] bg-gradient-to-b from-background to-muted/30 relative">
                    <motion.div
                        animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2 mb-5"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary" />
                        <div className="h-3 w-24 rounded-full bg-foreground/20" />
                    </motion.div>

                    <motion.div
                        animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 mb-5"
                    >
                        <div className="h-7 w-3/4 rounded-lg bg-foreground/80" />
                        <div className="h-4 w-full rounded-md bg-muted-foreground/30" />
                        <div className="h-4 w-2/3 rounded-md bg-muted-foreground/30" />
                    </motion.div>

                    <motion.div
                        animate={{ opacity: stage >= 3 ? 1 : 0, scale: stage >= 3 ? 1 : 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-3"
                    >
                        <div className="h-10 w-28 rounded-lg bg-primary flex items-center justify-center">
                            <span className="text-xs text-primary-foreground font-medium">Get Started</span>
                        </div>
                        <div className="h-10 w-24 rounded-lg border bg-card flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">Learn More</span>
                        </div>
                    </motion.div>

                    <motion.div
                        animate={{
                            opacity: stage >= 3 ? 1 : 0,
                            scale: stage >= 3 ? 1 : 0,
                            rotate: stage >= 3 ? 0 : -10
                        }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                    >
                        <CheckCircle className="w-3.5 h-3.5" />
                        You approve this
                    </motion.div>
                </div>
                */}
            </div>
        </div>
    )
}

// Build Animation
function BuildAnimation({ isActive }: { isActive: boolean }) {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!isActive) {
            setProgress(0)
            return
        }

        let p = 0
        const interval = setInterval(() => {
            p += 2
            if (p >= 100) {
                setProgress(100)
                clearInterval(interval)
            } else {
                setProgress(p)
            }
        }, 40)

        return () => clearInterval(interval)
    }, [isActive])

    const features = [
        { label: "Mobile-friendly", threshold: 20 },
        { label: "Lightning fast", threshold: 40 },
        { label: "SEO optimized", threshold: 60 },
        { label: "Secure & backed up", threshold: 80 },
    ]

    const isComplete = progress >= 100

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card shadow-2xl border rounded-2xl overflow-hidden">
                <div className="bg-muted/50 px-5 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Code className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Building your site</p>
                            <p className="text-xs text-muted-foreground">We handle the technical stuff</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 min-h-[280px]">
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-bold text-primary">{progress}%</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-75 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <motion.div 
                            className="space-y-3"
                            animate={{
                                gap: isComplete ? "0.5rem" : "1.25rem"
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            {features.map((feature, index) => {
                                const isDone = progress >= feature.threshold
                                return (
                                    <motion.div
                                        key={feature.label}
                                        className={`flex items-center gap-3 transition-opacity duration-300 ${isDone ? 'opacity-100' : 'opacity-40'}`}
                                        animate={{
                                            y: isComplete ? -4 * (3 - index) : 0
                                        }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${isDone ? 'bg-primary scale-110' : 'bg-muted'}`}
                                        >
                                            {isDone && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                                        </div>
                                        <span className={`text-sm transition-colors duration-300 ${isDone ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {feature.label}
                                        </span>
                                    </motion.div>
                                )
                            })}
                        </motion.div>
                    </div>

                    <div className="mt-4 h-[56px]">
                        <AnimatePresence>
                            {progress >= 100 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-primary/10 rounded-xl p-4 text-center"
                                >
                                    <p className="text-primary font-bold">🎉 Ready for launch!</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Launch Animation
function LaunchAnimation({ isActive }: { isActive: boolean }) {
    const [launched, setLaunched] = useState(false)
    const [visitors, setVisitors] = useState(0)

    useEffect(() => {
        if (!isActive) {
            setLaunched(false)
            setVisitors(0)
            return
        }

        const launchTimeout = setTimeout(() => {
            setLaunched(true)

            let v = 0
            const visitorInterval = setInterval(() => {
                v += Math.floor(Math.random() * 3) + 1
                setVisitors(v)
                if (v > 30) clearInterval(visitorInterval)
            }, 400)

            return () => clearInterval(visitorInterval)
        }, 500)

        return () => clearTimeout(launchTimeout)
    }, [isActive])

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-card shadow-2xl border rounded-2xl overflow-hidden">
                <div className="bg-muted/50 px-5 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
                            animate={launched ? { rotate: [0, -10, 10, 0] } : {}}
                            transition={{ duration: 0.5 }}
                        >
                            <Rocket className="w-5 h-5 text-primary" />
                        </motion.div>
                        <div>
                            <p className="font-bold text-foreground">Launch Day</p>
                            <p className="text-xs text-muted-foreground">Your site is live!</p>
                        </div>
                    </div>
                </div>

                <div className="p-5 space-y-5 min-h-[220px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {!launched ? (
                            <motion.div
                                key="countdown"
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center space-y-4"
                            >
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                    <motion.div
                                        className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                                <p className="text-muted-foreground text-sm">Deploying your website...</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="launched"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-5"
                            >
                                <div className="text-center space-y-2">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2 }}
                                        className="text-5xl"
                                    >
                                        🚀
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-foreground">You&apos;re live!</h3>
                                    <p className="text-sm text-muted-foreground">Customers can now find you online</p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-primary/10 rounded-xl p-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <span className="text-sm text-muted-foreground">Live visitors</span>
                                        </div>
                                        <span className="font-bold text-primary text-xl">{visitors}</span>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}

const steps: ProcessStep[] = [
    {
        icon: MessageCircle,
        title: "Tell us about your business",
        duration: "15 min call",
        description: "We ask simple questions to understand what you do and who you serve. No jargon, no pressure.",
        badge: "Step 1",
        component: DiscoveryCallAnimation,
    },
    {
        icon: Palette,
        title: "See your design before we build",
        duration: "3-5 days",
        description: "We create a preview of your website. You tell us what you like—we make changes until it's perfect.",
        badge: "Step 2",
        component: DesignPreviewAnimation,
    },
    {
        icon: Code,
        title: "We build, you relax",
        duration: "5-7 days",
        description: "Our team handles all the technical work. Your site will be fast, mobile-friendly, and easy for Google to find.",
        badge: "Step 3",
        component: BuildAnimation,
    },
    {
        icon: Rocket,
        title: "Go live and get found",
        duration: "Launch day",
        description: "We flip the switch and your website goes live. Customers can now find you when they search online.",
        badge: "Step 4",
        component: LaunchAnimation,
    },
]

// Individual Step Component
function ProcessStepCard({ step, index, totalSteps }: { step: ProcessStep; index: number; totalSteps: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { amount: 0.6, once: false })

    // Step 1 & 3: Text LEFT, Component RIGHT
    // Step 2 & 4: Component LEFT, Text RIGHT
    const isTextFirst = index % 2 === 0

    const TextContent = () => (
        <div className="space-y-5">
            <Badge className="inline-flex items-center gap-2 bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full text-sm font-bold">
                <step.icon className="w-4 h-4" />
                {step.badge}
            </Badge>

            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-black text-foreground leading-tight">
                {step.title}
            </h3>

            <p className="text-lg lg:text-xl text-muted-foreground leading-relaxed">
                {step.description}
            </p>

            <div className="flex items-center gap-2 text-primary font-medium text-lg">
                <Sparkles className="w-5 h-5" />
                <span>{step.duration}</span>
            </div>
        </div>
    )

    return (
        <motion.div
            ref={ref}
            className="relative py-16"
            animate={{
                opacity: isInView ? 1 : 0.3,
                scale: isInView ? 1 : 0.95,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className="container mx-auto px-6 max-w-6xl w-full">
                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_100px_1fr] gap-6 items-center">
                    {/* Left Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ amount: 0.4 }}
                        transition={{ duration: 0.5 }}
                    >
                        {isTextFirst ? <TextContent /> : <step.component isActive={isInView} />}
                    </motion.div>

                    {/* Center Timeline */}
                    <div className="flex flex-col items-center relative self-stretch">
                        {/* Step Circle */}
                        <div className="flex-1 flex items-center justify-center relative z-10">
                            <motion.div
                                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${isInView
                                    ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/40 scale-110'
                                    : 'bg-card border-2 border-primary/30 text-muted-foreground'
                                    }`}
                            >
                                <step.icon className="w-7 h-7" />
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ amount: 0.4 }}
                        transition={{ duration: 0.5 }}
                    >
                        {isTextFirst ? <step.component isActive={isInView} /> : <TextContent />}
                    </motion.div>
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center shrink-0 relative">
                        {/* Step Circle */}
                        <div className="relative z-10 mt-1">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isInView
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                    : 'bg-card border-2 border-primary/30 text-muted-foreground'
                                    }`}
                            >
                                <step.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <motion.div
                        className="flex-1 pb-4"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ amount: 0.3 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 px-3 py-1.5 rounded-full text-xs font-bold mb-3">
                            {step.badge}
                        </Badge>

                        <h3 className="text-xl sm:text-2xl font-black text-foreground leading-tight mb-2">
                            {step.title}
                        </h3>

                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                            {step.description}
                        </p>

                        <div className="flex items-center gap-2 text-primary font-medium text-sm mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>{step.duration}</span>
                        </div>

                        <div className="max-w-sm">
                            <step.component isActive={isInView} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

export function Process5() {
    return (
        <section className="bg-background py-16 lg:py-24">
            {/* Section Header */}
            <div className="container mx-auto px-6 max-w-4xl text-center mb-16 lg:mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Badge className="mb-6 px-4 py-2 bg-primary/10 text-primary border-primary/20">
                        <Layers className="w-4 h-4 mr-2" />
                        How It Works
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
                        From idea to live website in 7 days, not 7 months
                    </h2>
                    <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                        No confusing tech talk. No endless meetings. Just a simple 4-step process to get your business online.
                    </p>
                </motion.div>
            </div>

            {/* Timeline Steps */}
            <div className="relative">
                {/* Unified Continuous Line */}
                <div className="absolute inset-y-0 left-0 right-0 pointer-events-none">
                    <div className="container mx-auto px-6 h-full relative max-w-6xl">
                        {/* Desktop Line - Centered */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-primary/20 hidden lg:block" />
                        {/* Mobile Line - Aligned with icons */}
                        <div className="absolute left-12 -translate-x-1/2 w-0.5 h-full bg-primary/20 lg:hidden" />
                    </div>
                </div>

                {steps.map((step, index) => (
                    <ProcessStepCard
                        key={step.title}
                        step={step}
                        index={index}
                        totalSteps={steps.length}
                    />
                ))}
            </div>
        </section>
    )
}
