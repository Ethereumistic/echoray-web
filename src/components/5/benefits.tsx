"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { TrendingUp, Users, Clock, Shield, LineChart as LineChartIcon, Headphones, Search, X, Send } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"

// Google Search Animation Component
function GoogleSearchDemo({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [currentBusiness, setCurrentBusiness] = useState(0)
    const [searchQuery, setSearchQuery] = useState("")
    const [showResults, setShowResults] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [hasAnimated, setHasAnimated] = useState(false)

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

    // Only reset when we've fully left this slide and come back
    useEffect(() => {
        if (!isActive && wasActive) {
            // We just fully left this slide - reset for next time
            setSearchQuery("")
            setShowResults(false)
            setIsTyping(false)
            setCurrentBusiness(0)
            setHasAnimated(false)
        }
    }, [isActive, wasActive])

    // Start animation when becoming active
    useEffect(() => {
        if (!isActive) return
        if (hasAnimated) return

        // Small delay to ensure component is mounted
        const startDelay = setTimeout(() => {
            let index = 0
            const query = businesses[currentBusiness].query
            setIsTyping(true)
            setHasAnimated(true)

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

            // Store cleanup in a ref-like closure
            return () => clearInterval(interval)
        }, 100)

        return () => clearTimeout(startDelay)
    }, [isActive]) // Only depend on isActive, not hasAnimated

    const handleClear = () => {
        setShowResults(false)
        setSearchQuery("")
        setIsTyping(false)
        setHasAnimated(false)
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
function TrustAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
    const [animationKey, setAnimationKey] = useState(0)

    // Only reset animation when we fully leave and come back
    useEffect(() => {
        if (!isActive && wasActive) {
            // We just fully left this slide - increment key for fresh animation on return
            setAnimationKey(prev => prev + 1)
        }
    }, [isActive, wasActive])

    return (
        <div className="relative w-full max-w-lg mx-auto" key={animationKey}>
            <motion.div
                className="absolute inset-0 bg-primary/10 blur-3xl rounded-md"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ duration: 3, repeat: Infinity }}
            />

            <motion.div
                className="relative bg-card shadow-lg p-8 border rounded-md"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <motion.div
                        className="w-16 h-16 bg-primary rounded-md"
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
                        <div className="w-2 h-2 bg-primary rounded-sm" />
                        <span className="text-sm text-muted-foreground">SSL Secured</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-sm" />
                        <span className="text-sm text-muted-foreground">Professional Design</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-sm" />
                        <span className="text-sm text-muted-foreground">Verified Business</span>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    )
}

// Simple Clock Animation
function ClockAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
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
function LockAnimation({ isActive, wasActive }: { isActive?: boolean; wasActive?: boolean }) {
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

// Animated Chart using Recharts LineChart
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

    // Reset animation when fully leaving and coming back
    useEffect(() => {
        if (!isActive && wasActive) {
            setAnimationKey(prev => prev + 1)
        }
    }, [isActive, wasActive])

    return (
        <div className="w-full max-w-lg mx-auto" key={animationKey}>
            <motion.div
                className="bg-card shadow-lg p-8 border rounded-md"
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

// Website Support Chat Animation
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
            // User typing simulation with typewriter effect
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
                    }, 300)
                    timeoutsRef.current.push(sendTimeout)
                }
            }, 60)
            intervalsRef.current.push(typingInterval)
        } else {
            // Support is typing - show dots first
            setIsSupportTyping(true)

            const showMessageTimeout = setTimeout(() => {
                setIsSupportTyping(false)
                setMessages(prev => [...prev, currentMsg])
                setAnimationPhase(prev => prev + 1)
            }, 1500)
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
            }, 500)
            timeoutsRef.current.push(startTimeout)
        }
    }, [isActive])

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="bg-card shadow-lg overflow-hidden border rounded-md">
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
            stat: "99.9%",
            statLabel: "uptime guaranteed",
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

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Calculate the active index based on same snap points as slides
            // This ensures perfect sync between indicator and slides
            let newIndex = 0

            for (let i = 0; i < totalSlides; i++) {
                const slideStart = i / totalSlides
                const slideEnd = (i + 1) / totalSlides
                const transitionZone = (slideEnd - slideStart) * 0.2

                // We're on slide i if we're past its start transition zone
                if (latest >= slideStart + transitionZone) {
                    newIndex = i
                }
            }

            if (newIndex !== activeIndex) {
                // Update wasActive states - mark the previous index as "was active"
                setWasActiveStates(prev => {
                    const updated = [...prev]
                    updated[activeIndex] = true // The one we're leaving was active
                    return updated
                })
                setActiveIndex(newIndex)
            }
        })
        return unsubscribe
    }, [scrollYProgress, totalSlides, activeIndex])

    return (
        <>
            {/* Desktop: Horizontal scroll */}
            <div ref={containerRef} className="relative bg-background hidden lg:block" style={{ height: `${benefits.length * 100}vh` }}>
                <div className="sticky top-0 h-screen overflow-hidden">
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
                                            <benefit.component
                                                isActive={index === activeIndex}
                                                wasActive={wasActiveStates[index] && index !== activeIndex}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Progress indicator - fixed position - desktop only */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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

            {/* Mobile: Vertical scroll */}
            <div
                className="lg:hidden bg-background"
                style={{
                    scrollSnapType: 'y mandatory',
                    scrollPadding: '0px' // Ensures snapping aligns to viewport edge
                }}
            >
                {benefits.map((benefit, index) => (
                    <MobileBenefitItem key={benefit.title} benefit={benefit} />
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

function MobileBenefitItem({ benefit }: { benefit: Benefit }) {
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
                    <span className="text-4xl sm:text-5xl font-black text-primary">
                        {benefit.stat}
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

