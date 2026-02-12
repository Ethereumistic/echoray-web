"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, Clock, Shield, LineChart as LineChartIcon, Headphones, Search, X, Send, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

// Animated Counter Component - smoothly counts up to target
function AnimatedCounter({ target, suffix = "", prefix = "", duration = 1.5, isActive, decimals = 0 }: {
    target: number
    suffix?: string
    prefix?: string
    duration?: number
    isActive?: boolean
    decimals?: number
}) {
    const [count, setCount] = useState(0)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        if (!isActive || hasAnimated) return
        setHasAnimated(true)

        const startTime = Date.now()
        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(eased * target)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setCount(target)
            }
        }
        requestAnimationFrame(animate)
    }, [isActive, hasAnimated, target, duration])

    // Reset when leaving
    useEffect(() => {
        if (!isActive) {
            setCount(0)
            setHasAnimated(false)
        }
    }, [isActive])

    const displayValue = decimals > 0
        ? count.toFixed(decimals)
        : Math.round(count).toString()

    return (
        <span>
            {prefix}{displayValue}{suffix}
        </span>
    )
}

// Google Search Animation Component
function GoogleSearchDemo({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [currentBusiness, setCurrentBusiness] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [showResults, setShowResults] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [animationKey, setAnimationKey] = useState(0)
    const prevIsActiveRef = useRef(isActive)
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])
    const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

    const businesses = [
        {
            query: "today's horoscope taurus",
            results: [
                { name: "stars.guide", type: "Zodiac", isOwn: true },
                { name: "horoscope.com", type: "Zodiac" },
                { name: "astrology.com", type: "Zodiac" }
            ]
        },
        {
            query: "new cool social media platform",
            results: [
                { name: "yea.cool", type: "Social Media", isOwn: true },
                { name: "Competitor A", type: "Social Media" },
                { name: "Competitor B", type: "Social Media" }
            ]
        },
        {
            query: "i need a website for my business",
            results: [
                { name: "echoray.io", type: "Software Company", isOwn: true },
                { name: "Competitor C", type: "Design" },
                { name: "Competitor D", type: "Web Studio" }
            ]
        }
    ]

    // Cleanup helper
    const cleanupTimers = useCallback(() => {
        timeoutsRef.current.forEach(t => clearTimeout(t))
        intervalsRef.current.forEach(i => clearInterval(i))
        timeoutsRef.current = []
        intervalsRef.current = []
    }, [])

    // Replay animation when becoming active (skip first mount so it doesn't autoplay on page load)
    useEffect(() => {
        if (isActive && !prevIsActiveRef.current) {
            // Becoming active - advance to next business and replay
            setAnimationKey(prev => prev + 1)
            setCurrentBusiness(prev => (prev + 1) % businesses.length)
        }
        prevIsActiveRef.current = !!isActive
    }, [isActive, businesses.length])

    // Reset visual state when leaving the slide
    useEffect(() => {
        if (!isActive) {
            cleanupTimers()
            setSearchQuery("")
            setShowResults(false)
            setIsTyping(false)
        }
    }, [isActive, cleanupTimers])

    // Run the typing animation whenever animationKey changes (which happens on activation)
    useEffect(() => {
        if (!isActive) return

        cleanupTimers()
        setSearchQuery("")
        setShowResults(false)
        setIsTyping(false)

        // Small delay to ensure component is mounted
        const startDelay = setTimeout(() => {
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
            }, 53) // ~33% faster
            intervalsRef.current.push(interval)
        }, 67) // ~33% faster
        timeoutsRef.current.push(startDelay)

        return cleanupTimers
    }, [animationKey]) // eslint-disable-line react-hooks/exhaustive-deps

    // X button: 1 second delay, then retrigger with next business
    const handleClear = useCallback(() => {
        cleanupTimers()
        setShowResults(false)
        setSearchQuery("")
        setIsTyping(false)

        // 1 second delay, then advance business and retrigger animation
        const delayTimeout = setTimeout(() => {
            setCurrentBusiness(prev => (prev + 1) % businesses.length)
            setAnimationKey(prev => prev + 1)
        }, 1000)
        timeoutsRef.current.push(delayTimeout)
    }, [cleanupTimers, businesses.length])

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[500px] relative">
            {/* Radial glow */}
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
                layout
                className={`bg-card shadow-xl p-4 flex items-center gap-3 rounded-xl border w-full relative z-20 ${showResults ? 'mb-6' : 'mb-0'}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    y: showResults ? -20 : 0
                }}
                transition={{ duration: 0.33, type: "spring", stiffness: 130 }}
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
                            key={`${currentBusiness}-${animationKey}`}
                            className="space-y-4 w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {businesses[currentBusiness].results.map((result, i) => (
                                <motion.div
                                    key={i}
                                    className="bg-card/80 backdrop-blur-md p-5 border border-border rounded-xl relative flex justify-between items-start shadow-sm hover:shadow-md transition-shadow"
                                    initial={{ opacity: 0, y: 20, x: -10 }}
                                    animate={{ opacity: 1, y: 0, x: 0 }}
                                    transition={{
                                        delay: i * 0.1,
                                        duration: 0.33,
                                        type: "spring",
                                        stiffness: 130
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

// Trust/Credibility Animation Component - Redesigned with trust score meter
function TrustAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [animationKey, setAnimationKey] = useState(0)
    const prevIsActiveRef = useRef(isActive)

    // Replay animations when becoming active again
    useEffect(() => {
        if (isActive && !prevIsActiveRef.current) {
            setAnimationKey(prev => prev + 1)
        }
        prevIsActiveRef.current = !!isActive
    }, [isActive])

    const trustMetrics = [
        { label: "First Impressions", value: 94, delay: 0.6 },
        { label: "Credibility Score", value: 87, delay: 0.9 },
        { label: "Conversion Rate", value: 73, delay: 1.2 },
    ]

    return (
        <div className="relative w-full max-w-lg mx-auto" key={animationKey}>
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity }}
            />

            <motion.div
                className="relative bg-card shadow-lg p-8 border rounded-md"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Header with business info and stars */}
                <div className="flex items-center gap-4 mb-6">
                    <motion.div
                        className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-md flex items-center justify-center border border-primary/20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <Shield className="w-8 h-8 text-primary" />
                    </motion.div>
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

                {/* Trust Score Meter Bars */}
                <div className="space-y-4">
                    {trustMetrics.map((metric, i) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: metric.delay, duration: 0.4 }}
                        >
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
                                <motion.span
                                    className="text-sm font-bold text-primary"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: metric.delay + 0.3 }}
                                >
                                    {metric.value}%
                                </motion.span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${metric.value}%` }}
                                    transition={{
                                        delay: metric.delay + 0.1,
                                        duration: 0.8,
                                        ease: [0.16, 1, 0.3, 1] // custom ease out
                                    }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Trust indicators */}
                <motion.div
                    className="mt-6 pt-4 border-t border-border flex items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6 }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-muted-foreground">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-muted-foreground">Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-muted-foreground">Pro Design</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

// Simple Clock Animation - 33% slower hands
function ClockAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [hourRotation, setHourRotation] = useState(0)
    const [minuteRotation, setMinuteRotation] = useState(0)
    const [animationKey, setAnimationKey] = useState(0)
    const prevIsActiveRef = useRef(isActive)

    // Replay animations when becoming active again
    useEffect(() => {
        if (isActive && !prevIsActiveRef.current) {
            setAnimationKey(prev => prev + 1)
        }
        prevIsActiveRef.current = !!isActive
    }, [isActive])

    useEffect(() => {
        let animationId: number
        let startTime: number | null = null

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime

            // Hour hand: was 45 deg/sec, now 30 deg/sec (33% slower)
            setHourRotation((elapsed / 1000) * 30 % 360)
            // Minute hand: was 90 deg/sec, now 60 deg/sec (33% slower)
            setMinuteRotation((elapsed / 1000) * 60 % 360)

            animationId = requestAnimationFrame(animate)
        }

        animationId = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationId)
    }, [animationKey])

    return (
        <div className="relative w-64 h-64 mx-auto" key={animationKey}>
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
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
        </div>
    )
}

// Lock Security Animation - 33% faster keyhole animation, removed text
function LockAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [isLocked, setIsLocked] = useState(false)
    const [animationKey, setAnimationKey] = useState(0)
    const prevIsActiveRef = useRef(isActive)

    // Replay animations when becoming active again
    useEffect(() => {
        if (isActive && !prevIsActiveRef.current) {
            setAnimationKey(prev => prev + 1)
        }
        prevIsActiveRef.current = !!isActive
    }, [isActive])

    useEffect(() => {
        if (!isActive) {
            setIsLocked(false)
            return
        }
        // Was 800ms, now ~33% faster = 535ms
        const timer = setTimeout(() => setIsLocked(true), 535)
        return () => clearTimeout(timer)
    }, [isActive, animationKey])

    return (
        <div className="relative w-64 h-64 mx-auto" key={animationKey}>
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 4, repeat: Infinity }}
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
                    transition={{ delay: 0.2, type: "spring" }} // 33% faster
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
                    transition={{ duration: 0.53 }} // Was 0.8, now 33% faster
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
                    transition={{ delay: 0.67 }} // Was 1.0, now 33% faster
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
                    transition={{ delay: 0.8 }} // Was 1.2, now 33% faster
                />
            </svg>
        </div>
    )
}

// Animated Chart using Recharts LineChart - with fade-in for "Real" stat
function ChartAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [animationKey, setAnimationKey] = useState(0)

    const data = [
        { day: "Mon", visitors: 300 },
        { day: "Tue", visitors: 450 },
        { day: "Wed", visitors: 600 },
        { day: "Thu", visitors: 550 },
        { day: "Fri", visitors: 750 },
        { day: "Sat", visitors: 850 },
        { day: "Sun", visitors: 950 },
    ]

    const chartConfig = {
        visitors: {
            label: "Visitors",
            color: "var(--primary)",
        },
    }

    // Replay animation when becoming active again
    const prevIsActiveRef = useRef(isActive)
    useEffect(() => {
        if (isActive && !prevIsActiveRef.current) {
            setAnimationKey(prev => prev + 1)
        }
        prevIsActiveRef.current = !!isActive
    }, [isActive])

    return (
        <div className="w-full max-w-lg mx-auto relative" key={animationKey}>
            {/* Radial glow */}
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
                className="relative bg-card shadow-lg p-8 border rounded-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className="text-2xl font-bold mb-6 text-foreground">Visitor Analytics</h3>

                <ChartContainer config={chartConfig} className="h-64 w-full">
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                    >
                        <defs>
                            <linearGradient id="visitorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-visitors)" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="var(--color-visitors)" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                            className="text-xs fill-muted-foreground"
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            className="text-xs fill-muted-foreground"
                            width={40}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke="var(--color-visitors)"
                            strokeWidth={3}
                            fill="url(#visitorGradient)"
                            animationDuration={1500}
                            animationBegin={0}
                        />
                    </AreaChart>
                </ChartContainer>

                <motion.div
                    className="mt-6 flex items-center justify-between text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary rounded-sm" />
                        <span className="text-muted-foreground">+24% this week</span>
                    </div>
                    <span className="font-bold text-primary">4,450 total</span>
                </motion.div>
            </motion.div>
        </div>
    )
}

// Typing Dots Animation Component
function TypingDots() {
    return (
        <div className="flex gap-1 items-center px-4 py-3">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 bg-muted-foreground/60 rounded-full"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                    }}
                />
            ))}
        </div>
    )
}

// Website Support Chat Animation - 33% faster typing and replies
function ChatAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
    const [currentUserTyping, setCurrentUserTyping] = useState("")
    const [isSupportTyping, setIsSupportTyping] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const [animationPhase, setAnimationPhase] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const intervalsRef = useRef<NodeJS.Timeout[]>([])
    const timeoutsRef = useRef<NodeJS.Timeout[]>([])

    const conversation = [
        { text: "Hi! I'd like to update my website", isUser: true },
        { text: "Hello! I'd be happy to help with that. What would you like to change?", isUser: false },
        { text: "Can we add a contact form?", isUser: true },
        { text: "Absolutely! I can add a contact form with spam protection. Would you like me to proceed?", isUser: false },
    ]

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, currentUserTyping, isSupportTyping])

    // Cleanup function
    const cleanup = useCallback(() => {
        intervalsRef.current.forEach(clearInterval)
        timeoutsRef.current.forEach(clearTimeout)
        intervalsRef.current = []
        timeoutsRef.current = []
    }, [])

    // Reset when leaving the slide
    useEffect(() => {
        if (!isActive && wasActive) {
            cleanup()
            setMessages([])
            setCurrentUserTyping("")
            setIsSupportTyping(false)
            setInputValue("")
            setAnimationPhase(0)
        }
    }, [isActive, wasActive, cleanup])

    // Run animation sequence
    useEffect(() => {
        if (!isActive || animationPhase >= conversation.length) return

        const currentMsg = conversation[animationPhase]

        if (currentMsg.isUser) {
            // User typing simulation with typewriter effect - 33% faster
            let charIndex = 0
            const text = currentMsg.text

            const typingInterval = setInterval(() => {
                if (charIndex <= text.length) {
                    const currentText = text.slice(0, charIndex)
                    setCurrentUserTyping(currentText)
                    setInputValue(currentText)
                    charIndex++
                } else {
                    clearInterval(typingInterval)
                    // Simulate pressing send after a short delay
                    const sendTimeout = setTimeout(() => {
                        setMessages(prev => [...prev, currentMsg])
                        setCurrentUserTyping("")
                        setInputValue("")
                        setAnimationPhase(prev => prev + 1)
                    }, 200) // Was 300, now 33% faster
                    timeoutsRef.current.push(sendTimeout)
                }
            }, 40) // Was 60, now 33% faster
            intervalsRef.current.push(typingInterval)
        } else {
            // Support is typing - show dots first - 33% faster
            setIsSupportTyping(true)

            const showMessageTimeout = setTimeout(() => {
                setIsSupportTyping(false)
                setMessages(prev => [...prev, currentMsg])
                setAnimationPhase(prev => prev + 1)
            }, 1000) // Was 1500, now 33% faster
            timeoutsRef.current.push(showMessageTimeout)
        }

        return cleanup
    }, [isActive, animationPhase, cleanup])

    // Start the animation with a delay when becoming active
    useEffect(() => {
        if (isActive && animationPhase === 0 && messages.length === 0) {
            const startTimeout = setTimeout(() => {
                setAnimationPhase(0)
                // Trigger the first message
                setAnimationPhase(prev => prev) // Force re-render to start
            }, 333) // Was 500, now 33% faster
            timeoutsRef.current.push(startTimeout)
        }
    }, [isActive])

    return (
        <div className="w-full max-w-lg mx-auto relative">
            {/* Radial glow */}
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-full"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 6, repeat: Infinity }}
            />
            <motion.div
                className="relative bg-card shadow-lg overflow-hidden border rounded-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="bg-primary p-4 flex items-center gap-3 rounded-t-md">
                    <div className="w-10 h-10 bg-primary-foreground/20 rounded-md flex items-center justify-center">
                        <Headphones className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                        <h3 className="text-primary-foreground font-bold">Website Support</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-primary-foreground/80">Available 24/7</span>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="h-72 bg-muted/30">
                    <div ref={scrollRef} className="p-4 space-y-3">
                        {messages.map((msg, i) => (
                            <motion.div
                                key={i}
                                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                            >
                                <div className={`max-w-[85%] px-4 py-2.5 rounded-md ${msg.isUser
                                    ? 'bg-primary text-primary-foreground rounded-br-none'
                                    : 'bg-card text-card-foreground border rounded-bl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed">{msg.text}</p>
                                </div>
                            </motion.div>
                        ))}

                        {/* Support typing indicator */}
                        {isSupportTyping && (
                            <motion.div
                                className="flex justify-start"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="bg-card text-card-foreground border rounded-md rounded-bl-none">
                                    <TypingDots />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-3 border-t bg-card">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={inputValue}
                                readOnly
                                placeholder="Type your message..."
                                className="w-full px-4 py-2.5 bg-muted/50 border rounded-md text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            {currentUserTyping && (
                                <motion.span
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-bold"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                >
                                    |
                                </motion.span>
                            )}
                        </div>
                        <motion.button
                            className="p-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Send className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>
            </motion.div>
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
            badge: "Search Priority",
            mobileTranslateY: "-3rem" // Adjust as needed
        },
        {
            icon: Users,
            title: "Build instant trust",
            description: "A professional website makes people trust your business.",
            stat: "75%",
            statLabel: "judge credibility by website design",
            component: TrustAnimation,
            badge: "Trust at First Sight",
            mobileTranslateY: "3rem" // Adjust as needed
        },
        {
            icon: Clock,
            title: "Save time",
            description: "Answer common questions and take bookings automatically.",
            stat: "10+",
            statLabel: "hours saved per week on average",
            component: ClockAnimation,
            badge: "Work While You Sleep",
            mobileTranslateY: "0rem" // Adjust as needed
        },
        {
            icon: Shield,
            title: "Stay secure",
            description: "We handle security so your customers' data stays safe.",
            stat: "99%",
            statLabel: "uptime",
            component: LockAnimation,
            badge: "Peace of Mind",
            mobileTranslateY: "1rem" // Adjust as needed
        },
        {
            icon: LineChartIcon,
            title: "Track results",
            description: "See how many people visit and what they do.",
            stat: "Real",
            statLabel: "data to make better decisions",
            component: ChartAnimation,
            badge: "Clarity Over Guessing",
            mobileTranslateY: "-1.5rem" // Adjust as needed
        },
        {
            icon: Headphones,
            title: "Get support",
            description: "Real humans ready to help when you need it.",
            stat: "24h",
            statLabel: "response time on all requests",
            component: ChatAnimation,
            badge: "Real Humans",
            mobileTranslateY: "-1rem" // Adjust as needed
        }
    ]

    // Calculate the current active slide based on scroll progress
    const totalSlides = benefits.length

    // Track if the benefits container is actually visible in the viewport
    // This prevents the first slide's animation from firing before the user scrolls to it
    const [isContainerVisible, setIsContainerVisible] = useState(false)
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsContainerVisible(entry.isIntersecting)
            },
            { threshold: 0.05 }
        )
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

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

    // Calculate active index for the progress indicator
    // Using the same snap logic as the slides for perfect sync
    const [activeIndex, setActiveIndex] = useState(0)

    // Track which slides were previously active (for wasActive prop)
    const [wasActiveStates, setWasActiveStates] = useState<boolean[]>(() =>
        Array(totalSlides).fill(false)
    )

    // Track active index using ref to avoid stale closures in scroll listener
    const activeIndexRef = useRef(0)

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Calculate the active index based on same snap points as slides
            // This ensures perfect sync between indicator and slides
            let newIndex = 0

            for (let i = 0; i < totalSlides; i++) {
                const slideStart = i / totalSlides
                const slideEnd = (i + 1) / totalSlides
                const transitionZone = (slideEnd - slideStart) * 0.2

                // Switch indicator at the midpoint of each slide segment
                // This prevents premature switching with tiny scrolls
                const slideMidpoint = (slideStart + slideEnd) / 2
                if (latest >= slideMidpoint) {
                    newIndex = i
                }
                // But also snap to it once past the transition zone start
                // (ensures we never lag behind the visual)
                if (i === 0 && latest < (slideEnd - transitionZone)) {
                    newIndex = 0
                }
            }

            // Also handle: if we're past the start of hold zone for any slide,
            // that slide should be active (ensures sync with visuals)
            for (let i = totalSlides - 1; i >= 0; i--) {
                const slideStart = i / totalSlides
                const slideEnd = (i + 1) / totalSlides
                const transitionZone = (slideEnd - slideStart) * 0.2
                if (latest >= slideStart + transitionZone && latest <= slideEnd - transitionZone) {
                    newIndex = i
                    break
                }
            }

            if (newIndex !== activeIndexRef.current) {
                const prevIndex = activeIndexRef.current
                activeIndexRef.current = newIndex
                // Update wasActive states - mark the previous index as "was active"
                setWasActiveStates(prev => {
                    const updated = [...prev]
                    updated[prevIndex] = true // The one we're leaving was active
                    return updated
                })
                setActiveIndex(newIndex)
            }
        })
        return unsubscribe
    }, [scrollYProgress, totalSlides]) // No activeIndex dependency - uses ref instead

    // Navigate to a specific slide by scrolling the page
    const navigateToSlide = useCallback((slideIndex: number) => {
        if (!containerRef.current) return
        const containerRect = containerRef.current.getBoundingClientRect()
        const containerTop = containerRef.current.offsetTop
        const totalScrollHeight = containerRef.current.scrollHeight - window.innerHeight

        // Calculate the scroll position for the target slide
        // Each slide occupies 1/totalSlides of the scroll range
        const slideCenter = (slideIndex + 0.5) / totalSlides
        const targetScroll = containerTop + (slideCenter * totalScrollHeight)

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        })
    }, [totalSlides])

    // Handle chevron navigation
    const handlePrev = useCallback(() => {
        if (activeIndex === 0) {
            // On first slide, scroll to top of page
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            navigateToSlide(activeIndex - 1)
        }
    }, [activeIndex, navigateToSlide])

    const handleNext = useCallback(() => {
        if (activeIndex === totalSlides - 1) {
            // On last slide, scroll to the next section below
            if (containerRef.current) {
                const containerBottom = containerRef.current.offsetTop + containerRef.current.offsetHeight
                window.scrollTo({ top: containerBottom, behavior: 'smooth' })
            }
        } else {
            navigateToSlide(activeIndex + 1)
        }
    }, [activeIndex, totalSlides, navigateToSlide])

    // Render the stat with animation for specific slides
    const renderStat = (benefit: typeof benefits[0], index: number) => {
        const isSlideActive = index === activeIndex && isContainerVisible
        switch (index) {
            case 1: // 75% - animated
                return (
                    <AnimatedCounter
                        target={75}
                        suffix="%"
                        duration={1.5}
                        isActive={isSlideActive}
                    />
                )
            case 2: // 10+ - animated
                return (
                    <AnimatedCounter
                        target={10}
                        suffix="+"
                        duration={1.2}
                        isActive={isSlideActive}
                    />
                )
            case 3: // 99% - animated (changed from 99.9)
                return (
                    <AnimatedCounter
                        target={99}
                        suffix="%"
                        duration={1.8}
                        isActive={isSlideActive}
                    />
                )
            case 4: // "Real" - cool fade in
                return (
                    <motion.span
                        key={isSlideActive ? 'active' : 'inactive'}
                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                        animate={isSlideActive ? {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)'
                        } : {
                            opacity: 0,
                            y: 20,
                            filter: 'blur(10px)'
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Real
                    </motion.span>
                )
            default:
                return benefit.stat
        }
    }

    return (
        <>
            {/* Desktop: Horizontal scroll */}
            <div ref={containerRef} className="relative bg-background hidden lg:block" style={{ height: `${benefits.length * 100}vh` }}>
                <div className="sticky top-0 h-screen overflow-hidden">
                    {/* Chevron Left */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-4 xl:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:bg-card hover:shadow-xl transition-all duration-200 group cursor-pointer"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>

                    {/* Chevron Right */}
                    <button
                        onClick={handleNext}
                        className="absolute right-4 xl:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:bg-card hover:shadow-xl transition-all duration-200 group cursor-pointer"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>

                    {/* Horizontal sliding container */}
                    <motion.div
                        className="flex h-full"
                        style={{ x }}
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
                                            <Badge className="inline-flex items-center gap-3 bg-card backdrop-blur-sm px-6 py-3 shadow-lg border rounded-md">
                                                <benefit.icon className="w-6 h-6 text-primary" />
                                                <span className="font-bold text-foreground">{benefit.badge}</span>
                                            </Badge>

                                            <h2 className="text-5xl lg:text-7xl font-black text-foreground leading-tight">
                                                {benefit.title}
                                            </h2>

                                            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                                                {benefit.description}
                                            </p>

                                            <div className="flex items-baseline gap-3 pt-4">
                                                <span className="text-6xl font-black text-primary" style={{ minWidth: [1, 2, 3].includes(index) ? '4ch' : undefined, display: 'inline-block' }}>
                                                    {renderStat(benefit, index)}
                                                </span>
                                                <span className="text-lg text-muted-foreground max-w-xs">
                                                    {benefit.statLabel}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right side - Animation - hidden when not active to prevent stale state flash during transitions */}
                                        <div
                                            className="flex items-center justify-center"
                                            style={{ opacity: (index === activeIndex && isContainerVisible) ? 1 : 0 }}
                                        >
                                            <benefit.component
                                                isActive={index === activeIndex && isContainerVisible}
                                                wasActive={wasActiveStates[index] && index !== activeIndex}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Progress indicator - fixed position - desktop only - clickable dots */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {benefits.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => navigateToSlide(i)}
                                className={`h-2 transition-all rounded-full duration-300 cursor-pointer hover:opacity-80 ${i === activeIndex ? 'w-12 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/40'
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile: Vertical scroll */}
            <div
                className="lg:hidden bg-background"
                style={{
                    scrollSnapType: 'y mandatory',
                    scrollPadding: '0px' // Ensures snapping aligns to viewport edge
                }}
            >
                {benefits.map((benefit, index) => (
                    <MobileBenefitItem key={benefit.title} benefit={benefit} index={index} />
                ))}
            </div>
        </>
    )
}

interface Benefit {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
    stat: string
    statLabel: string
    component: React.ComponentType<{ isActive?: boolean; wasActive?: boolean }>
    badge: string
    mobileTranslateY: string
}

function MobileBenefitItem({ benefit, index }: { benefit: Benefit; index: number }) {
    const sectionRef = useRef<HTMLDivElement>(null)
    const [isInView, setIsInView] = useState(false)
    const [hasBeenInView, setHasBeenInView] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    setHasBeenInView(true)
                } else {
                    setIsInView(false)
                }
            },
            { threshold: 0.5 } // Trigger when 50% visible
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current)
            }
        }
    }, [])

    // Mobile stat rendering with counters
    const renderMobileStat = () => {
        switch (index) {
            case 1:
                return <AnimatedCounter target={75} suffix="%" duration={1.5} isActive={isInView} />
            case 2:
                return <AnimatedCounter target={10} suffix="+" duration={1.2} isActive={isInView} />
            case 3:
                return <AnimatedCounter target={99} suffix="%" duration={1.8} isActive={isInView} />
            case 4:
                return (
                    <motion.span
                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                        animate={isInView ? {
                            opacity: 1,
                            y: 0,
                            filter: 'blur(0px)'
                        } : {
                            opacity: 0,
                            y: 20,
                            filter: 'blur(10px)'
                        }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        Real
                    </motion.span>
                )
            default:
                return benefit.stat
        }
    }

    return (
        <div
            ref={sectionRef}
            className="min-h-screen flex items-center justify-center px-4 py-16"
            style={{
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always' // Forces snap to stop at each section
            }}
        >
            <div className="w-full max-w-2xl space-y-2">
                {/* Badge */}
                <Badge className="inline-flex items-center gap-2 bg-card backdrop-blur-sm px-4 py-2 shadow-lg border rounded-md text-xs">
                    <benefit.icon className="w-4 h-4 text-primary" />
                    <span className="font-bold text-foreground">{benefit.badge}</span>
                </Badge>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">
                    {benefit.title}
                </h2>

                {/* Description */}
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {benefit.description}
                </p>

                {/* Stat */}
                <div className="flex items-baseline gap-2 pt-2">
                    <span className="text-4xl sm:text-5xl font-black text-primary" style={{ minWidth: [1, 2, 3].includes(index) ? '3.5ch' : undefined, display: 'inline-block' }}>
                        {renderMobileStat()}
                    </span>
                    <span className="text-sm sm:text-base text-muted-foreground max-w-[200px]">
                        {benefit.statLabel}
                    </span>
                </div>

                {/* Animation - scaled down and moved up for mobile */}
                <div
                    className="flex items-center justify-center"
                    style={{
                        transform: `translateY(${benefit.mobileTranslateY}) scale(0.8)`,
                        transformOrigin: 'center'
                    }}
                >
                    <benefit.component
                        isActive={isInView}
                        wasActive={hasBeenInView && !isInView}
                    />
                </div>
            </div>
        </div>
    )
}
