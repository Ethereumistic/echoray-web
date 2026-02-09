"use client"

import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, Clock, Shield, LineChart, Headphones, Search, Lock, MessageSquare, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

// Google Search Animation Component
function GoogleSearchDemo({ isActive }: { isActive?: boolean }) {
    const [currentBusiness, setCurrentBusiness] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [showResults, setShowResults] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const businesses = [
        {
            query: "coffee shop near me",
            results: [
                { name: "Your Coffee Shop", type: "Local Business", isOwn: true },
                { name: "Competitor Cafe", type: "Coffee Shop" },
                { name: "Another Coffee Place", type: "Cafe" }
            ]
        },
        {
            query: "best plumber in town",
            results: [
                { name: "Your Plumber Service", type: "Plumbing Service", isOwn: true },
                { name: "Standard Plumbing", type: "Plumbing" },
                { name: "Quick Fix Pipes", type: "Plumber" }
            ]
        },
        {
            query: "creative web agency",
            results: [
                { name: "Your Digital Studio", type: "Web Design", isOwn: true },
                { name: "Basic Web Co", type: "Design" },
                { name: "Old School Layouts", type: "Web Studio" }
            ]
        }
    ]

    useEffect(() => {
        if (!isActive) {
            setSearchQuery("")
            setShowResults(false)
            setIsTyping(false)
            setCurrentBusiness(0)
            return
        }

        let index = 0
        const query = businesses[currentBusiness].query
        setIsTyping(true)

        const interval = setInterval(() => {
            if (index <= query.length) {
                setSearchQuery(query.slice(0, index))
                index++
            } else {
                setIsTyping(false)
                setShowResults(true)
                clearInterval(interval)
            }
        }, 80)

        return () => clearInterval(interval)
    }, [isActive, currentBusiness])

    const handleClear = () => {
        setShowResults(false)
        setSearchQuery("")
        setIsTyping(false)
        setCurrentBusiness((prev) => (prev + 1) % businesses.length)
    }

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[500px]">
            <motion.div
                layout
                className={`bg-card shadow-xl p-4 flex items-center gap-3 rounded-xl border w-full relative z-20 ${showResults ? 'mb-6' : 'mb-0'}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: showResults ? -20 : 0
                }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
            >
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                    type="text"
                    value={searchQuery}
                    readOnly
                    className="flex-1 text-lg outline-none bg-transparent text-foreground font-medium"
                    placeholder="Search Google..."
                />
                <AnimatePresence>
                    {(searchQuery.length > 0 || showResults) && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={handleClear}
                            className="p-1 hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </motion.div>

            <div className="w-full space-y-4">
                <AnimatePresence mode="wait">
                    {showResults && (
                        <motion.div
                            key={currentBusiness}
                            className="space-y-4 w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {businesses[currentBusiness].results.map((result, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-card/80 backdrop-blur-md p-5 border border-border rounded-xl relative flex justify-between items-start shadow-sm hover:shadow-md transition-shadow"
                                    initial={{ opacity: 0, y: 20, x: -10 }}
                                    animate={{ opacity: 1, y: 0, x: 0 }}
                                    transition={{
                                        delay: i * 0.15,
                                        duration: 0.5,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-lg text-foreground">{result.name}</h4>
                                            {result.isOwn && (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors py-0 px-2 text-[10px] font-bold uppercase tracking-wider">
                                                    your company
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            {result.type}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end justify-center self-center">
                                        <div className="flex gap-0.5 text-yellow-500">
                                            {[...Array(5 - i)].map((_, star) => (
                                                <span key={star} className="text-xl">★</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Trust/Credibility Animation Component
function TrustAnimation({ isActive }: { isActive?: boolean }) {
    return (
        <div className="relative w-full max-w-lg mx-auto" key={isActive ? 'active' : 'inactive'}>
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
                className="relative bg-card shadow-lg p-8 border"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <motion.div
                        className="w-16 h-16 bg-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div>
                        <h3 className="font-bold text-xl text-foreground">Your Business</h3>
                        <motion.div
                            className="flex gap-1 mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            {[...Array(5)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.7 + i * 0.1, type: "spring" }}
                                    className="text-primary text-xl"
                                >
                                    ★
                                </motion.span>
                            ))}
                        </motion.div>
                    </div>
                </div>

                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary" />
                        <span className="text-sm text-muted-foreground">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary" />
                        <span className="text-sm text-muted-foreground">Professional Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary" />
                        <span className="text-sm text-muted-foreground">Verified Business</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

// Simple Clock Animation
function ClockAnimation({ isActive }: { isActive?: boolean }) {
    const [hourRotation, setHourRotation] = useState(0)
    const [minuteRotation, setMinuteRotation] = useState(0)

    useEffect(() => {
        let animationId: number
        let startTime: number | null = null

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime

            // Hour hand: 360 degrees in 8 seconds (45 deg/sec)
            setHourRotation((elapsed / 1000) * 45 % 360)
            // Minute hand: 360 degrees in 4 seconds (90 deg/sec)
            setMinuteRotation((elapsed / 1000) * 90 % 360)

            animationId = requestAnimationFrame(animate)
        }

        animationId = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationId)
    }, [])

    return (
        <div className="relative w-64 h-64 mx-auto">
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
                {/* Clock circle */}
                <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                />

                {/* Hour markers */}
                {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180)
                    const x1 = 100 + Math.cos(angle) * 70
                    const y1 = 100 + Math.sin(angle) * 70
                    const x2 = 100 + Math.cos(angle) * 60
                    const y2 = 100 + Math.sin(angle) * 60

                    return (
                        <motion.line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-primary"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + i * 0.05 }}
                        />
                    )
                })}

                {/* Hour hand - using SVG transform with rotate(angle, cx, cy) */}
                <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="55"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                    className="text-primary"
                    transform={`rotate(${hourRotation}, 100, 100)`}
                />

                {/* Minute hand - using SVG transform with rotate(angle, cx, cy) */}
                <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="35"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-primary"
                    transform={`rotate(${minuteRotation}, 100, 100)`}
                />

                {/* Center dot */}
                <circle cx="100" cy="100" r="6" fill="currentColor" className="text-primary" />
            </svg>

            <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <p className="text-3xl font-bold text-primary">10+ hours</p>
                <p className="text-sm text-muted-foreground">saved weekly</p>
            </motion.div>
        </div>
    )
}

// Lock Security Animation
function LockAnimation({ isActive }: { isActive?: boolean }) {
    const [isLocked, setIsLocked] = useState(false)

    useEffect(() => {
        if (!isActive) {
            setIsLocked(false)
            return
        }
        const timer = setTimeout(() => setIsLocked(true), 800)
        return () => clearTimeout(timer)
    }, [isActive])

    return (
        <div className="relative w-64 h-64 mx-auto">
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-2xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            <svg viewBox="0 0 200 200" className="w-full h-full relative z-10">
                {/* Lock body */}
                <motion.rect
                    x="60"
                    y="90"
                    width="80"
                    height="70"
                    rx="10"
                    fill="currentColor"
                    className="text-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                />

                {/* Lock shackle */}
                <motion.path
                    d="M 75 90 L 75 60 Q 75 40, 100 40 Q 125 40, 125 60 L 125 90"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="text-primary"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8 }}
                />

                {/* Keyhole */}
                <motion.circle
                    cx="100"
                    cy="115"
                    r="8"
                    fill="currentColor"
                    className="text-background"
                    initial={{ scale: 0 }}
                    animate={{ scale: isLocked ? 1 : 0 }}
                    transition={{ delay: 1 }}
                />
                <motion.rect
                    x="96"
                    y="120"
                    width="8"
                    height="15"
                    fill="currentColor"
                    className="text-background"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: isLocked ? 1 : 0 }}
                    transition={{ delay: 1.2 }}
                />
            </svg>

            <motion.p
                className="text-center mt-4 text-xl font-bold text-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                99.9% Uptime
            </motion.p>
        </div>
    )
}

// Animated Chart using shadcn chart
function ChartAnimation({ isActive }: { isActive?: boolean }) {
    const data = [
        { day: "Mon", visitors: 300 },
        { day: "Tue", visitors: 450 },
        { day: "Wed", visitors: 600 },
        { day: "Thu", visitors: 550 },
        { day: "Fri", visitors: 750 },
        { day: "Sat", visitors: 850 },
        { day: "Sun", visitors: 950 },
    ]

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-card shadow-lg p-8 border">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Visitor Analytics</h3>

                <div className="flex items-end justify-between h-64 gap-3">
                    {data.map((item, i) => {
                        const maxValue = 1000
                        const heightPercent = (item.visitors / maxValue) * 100

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    className="w-full bg-primary relative"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${heightPercent}%` }}
                                    transition={{ delay: i * 0.15, duration: 0.8, type: "spring" }}
                                >
                                    <motion.div
                                        className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 text-xs font-bold whitespace-nowrap border"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.15 + 0.8 }}
                                    >
                                        {item.visitors}
                                    </motion.div>
                                </motion.div>
                                <span className="text-xs text-muted-foreground">{item.day}</span>
                            </div>
                        )
                    })}
                </div>

                <motion.div
                    className="mt-8 flex items-center justify-between text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary" />
                        <span className="text-muted-foreground">+24% this week</span>
                    </div>
                    <span className="font-bold text-primary">4,450 total</span>
                </motion.div>
            </div>
        </div>
    )
}

// Website Support Chat Animation
function ChatAnimation({ isActive }: { isActive?: boolean }) {
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
    const [currentTyping, setCurrentTyping] = useState("")

    useEffect(() => {
        if (!isActive) {
            setMessages([])
            setCurrentTyping("")
            return
        }

        const sequence = [
            { text: "Hi! I'd like to update my website", isUser: true, delay: 500 },
            { text: "Hello! I'd be happy to help with that. What would you like to change on your site?", isUser: false, delay: 1500 },
            { text: "Can we add a contact form?", isUser: true, delay: 2800 },
            { text: "Absolutely! I can add a contact form to your website. It will include fields for name, email, and message, with spam protection included. Would you like me to proceed?", isUser: false, delay: 3800 }
        ]

        let timeouts: NodeJS.Timeout[] = []

        sequence.forEach((msg, i) => {
            const timeout = setTimeout(() => {
                if (msg.isUser) {
                    setMessages(prev => [...prev, msg])
                } else {
                    // Typing animation for support responses
                    let charIndex = 0
                    const typingInterval = setInterval(() => {
                        if (charIndex <= msg.text.length) {
                            setCurrentTyping(msg.text.slice(0, charIndex))
                            charIndex++
                        } else {
                            clearInterval(typingInterval)
                            setMessages(prev => [...prev, msg])
                            setCurrentTyping("")
                        }
                    }, 30)
                }
            }, msg.delay)
            timeouts.push(timeout)
        })

        return () => {
            timeouts.forEach(clearTimeout)
        }
    }, [isActive])

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-card shadow-lg overflow-hidden border">
                <div className="bg-primary p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-foreground/20 flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-primary-foreground font-bold">Website Support</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-foreground animate-pulse" />
                            <span className="text-xs text-primary-foreground/80">Available 24/7</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4 h-80 overflow-y-auto bg-muted/30">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className={`max-w-xs px-4 py-3 ${msg.isUser
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card text-card-foreground border'
                                }`}>
                                {msg.text}
                            </div>
                        </motion.div>
                    ))}

                    {currentTyping && (
                        <motion.div
                            className="flex justify-start"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="max-w-xs px-4 py-3 bg-card text-card-foreground border">
                                {currentTyping}
                                <motion.span
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    |
                                </motion.span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Main Component
export function BenefitsHorizontal() {
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const benefits = [
        {
            icon: TrendingUp,
            title: "Get found online",
            description: "Show up when customers search for businesses like yours.",
            stat: "85%",
            statLabel: "of customers Google before buying",
            component: GoogleSearchDemo,
        },
        {
            icon: Users,
            title: "Build instant trust",
            description: "A professional website makes people trust your business.",
            stat: "75%",
            statLabel: "judge credibility by website design",
            component: TrustAnimation,
        },
        {
            icon: Clock,
            title: "Save time",
            description: "Answer common questions and take bookings automatically.",
            stat: "10+",
            statLabel: "hours saved per week on average",
            component: ClockAnimation,
        },
        {
            icon: Shield,
            title: "Stay secure",
            description: "We handle security so your customers' data stays safe.",
            stat: "99.9%",
            statLabel: "uptime guaranteed",
            component: LockAnimation,
        },
        {
            icon: LineChart,
            title: "Track results",
            description: "See exactly how many people visit and what they do.",
            stat: "Real",
            statLabel: "data to make better decisions",
            component: ChartAnimation,
        },
        {
            icon: Headphones,
            title: "Get support",
            description: "Real humans ready to help when you need it.",
            stat: "24h",
            statLabel: "response time on all requests",
            component: ChatAnimation,
        }
    ]

    // Calculate the current active slide based on scroll progress
    const totalSlides = benefits.length

    // Create snap points for each slide
    // Each slide takes up 1/totalSlides of the scroll, but we add a "resting zone"
    // in the middle of each segment where the slide stays locked
    const snapInputs: number[] = []
    const snapOutputs: string[] = []

    for (let i = 0; i < totalSlides; i++) {
        const slideStart = i / totalSlides
        const slideEnd = (i + 1) / totalSlides

        // Create a snap zone: quick transition, then hold, then quick transition
        // First 20% of segment: transition from previous slide
        // Middle 60% of segment: hold at current slide
        // Last 20% of segment: transition to next slide
        const transitionZone = (slideEnd - slideStart) * 0.2

        if (i === 0) {
            // First slide - start at 0
            snapInputs.push(0)
            snapOutputs.push('0%')
        }

        // Start of hold zone
        snapInputs.push(slideStart + transitionZone)
        snapOutputs.push(`-${i * 100}%`)

        // End of hold zone (before transition to next)
        snapInputs.push(slideEnd - transitionZone)
        snapOutputs.push(`-${i * 100}%`)

        if (i === totalSlides - 1) {
            // Last slide - end at 1
            snapInputs.push(1)
            snapOutputs.push(`-${i * 100}%`)
        }
    }

    // Transform scroll progress to horizontal translation with snapping
    const x = useTransform(scrollYProgress, snapInputs, snapOutputs)

    // Smooth out the animation for a nice easing effect
    const smoothX = useSpring(x, { stiffness: 300, damping: 40, restDelta: 0.001 })

    // Calculate active index for the progress indicator
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            const newIndex = Math.min(
                Math.round(latest * totalSlides),
                totalSlides - 1
            )
            setActiveIndex(newIndex)
        })
        return unsubscribe
    }, [scrollYProgress, totalSlides])

    return (
        <div ref={containerRef} className="relative bg-background" style={{ height: `${benefits.length * 100}vh` }}>
            <div className="sticky top-0 h-screen overflow-hidden">
                {/* Horizontal sliding container */}
                <motion.div
                    className="flex h-full"
                    style={{ x: smoothX }}
                >
                    {benefits.map((benefit, index) => (
                        <div
                            key={benefit.title}
                            className="shrink-0 w-screen h-full flex items-center justify-center"
                        >
                            <div className="container mx-auto px-6 max-w-6xl">
                                <div className="grid lg:grid-cols-2 gap-12 items-center">
                                    {/* Left side - Content */}
                                    <div className="space-y-6">
                                        <Badge className="inline-flex items-center gap-3 bg-card backdrop-blur-sm px-6 py-3 shadow-lg border">
                                            <benefit.icon className="w-6 h-6 text-primary" />
                                            <span className="font-bold text-foreground">Benefit {index + 1}/6</span>
                                        </Badge>

                                        <h2 className="text-5xl lg:text-7xl font-black text-foreground leading-tight">
                                            {benefit.title}
                                        </h2>

                                        <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                                            {benefit.description}
                                        </p>

                                        <div className="flex items-baseline gap-3 pt-4">
                                            <span className="text-6xl font-black text-primary">
                                                {benefit.stat}
                                            </span>
                                            <span className="text-lg text-muted-foreground max-w-xs">
                                                {benefit.statLabel}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right side - Animation */}
                                    <div className="flex items-center justify-center">
                                        <benefit.component isActive={index === activeIndex} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Progress indicator - fixed position */}
                <div className="absolute  bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {benefits.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 transition-all rounded-full duration-300 ${i === activeIndex ? 'w-12 bg-primary' : 'w-2 bg-muted'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

