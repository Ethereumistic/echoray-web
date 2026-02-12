"use client"

import { motion, useInView } from "framer-motion"
import { MessageCircle, Palette, Code, Rocket, CheckCircle, type LucideIcon, Sparkles, Layers } from "lucide-react"
import { useRef, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence } from "framer-motion"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Hero3D } from "@/components/5/hero-3d"

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
            </div>
        </div>
    )
}

// Code Editor Typewriter Animation
function BuildAnimation({ isActive }: { isActive: boolean }) {
    const [visibleLines, setVisibleLines] = useState(0)
    const [cursorVisible, setCursorVisible] = useState(true)

    const codeLines = [
        { indent: 0, tokens: [{ text: 'import', type: 'keyword' as const }, { text: ' { ', type: 'plain' as const }, { text: 'Header', type: 'component' as const }, { text: ', ', type: 'plain' as const }, { text: 'Footer', type: 'component' as const }, { text: ' } ', type: 'plain' as const }, { text: 'from', type: 'keyword' as const }, { text: ' ', type: 'plain' as const }, { text: "'./components'", type: 'string' as const }] },
        { indent: 0, tokens: [{ text: 'import', type: 'keyword' as const }, { text: ' ', type: 'plain' as const }, { text: "'./globals.css'", type: 'string' as const }] },
        { indent: 0, tokens: [] },
        { indent: 0, tokens: [{ text: 'export default', type: 'keyword' as const }, { text: ' ', type: 'plain' as const }, { text: 'function', type: 'keyword' as const }, { text: ' ', type: 'plain' as const }, { text: 'Layout', type: 'function' as const }, { text: '({ children }) {', type: 'plain' as const }] },
        { indent: 1, tokens: [{ text: 'return', type: 'keyword' as const }, { text: ' (', type: 'plain' as const }] },
        { indent: 2, tokens: [{ text: '<html', type: 'tag' as const }, { text: ' ', type: 'plain' as const }, { text: 'lang', type: 'attr' as const }, { text: '=', type: 'plain' as const }, { text: '"en"', type: 'string' as const }, { text: '>', type: 'tag' as const }] },
        { indent: 3, tokens: [{ text: '<body>', type: 'tag' as const }] },
        { indent: 4, tokens: [{ text: '<Header', type: 'component' as const }, { text: ' />', type: 'tag' as const }] },
        { indent: 4, tokens: [{ text: '<main>', type: 'tag' as const }, { text: '{children}', type: 'expression' as const }, { text: '</main>', type: 'tag' as const }] },
        { indent: 4, tokens: [{ text: '<Footer', type: 'component' as const }, { text: ' />', type: 'tag' as const }] },
        { indent: 3, tokens: [{ text: '</body>', type: 'tag' as const }] },
        { indent: 2, tokens: [{ text: '</html>', type: 'tag' as const }] },
        { indent: 1, tokens: [{ text: ')', type: 'plain' as const }] },
        { indent: 0, tokens: [{ text: '}', type: 'plain' as const }] },
    ]

    useEffect(() => {
        if (!isActive) {
            setVisibleLines(0)
            return
        }

        const timeouts: NodeJS.Timeout[] = []
        codeLines.forEach((_, i) => {
            const timeout = setTimeout(() => {
                setVisibleLines(i + 1)
            }, 300 + i * 180)
            timeouts.push(timeout)
        })

        return () => timeouts.forEach(clearTimeout)
    }, [isActive])

    // Blinking cursor
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(v => !v)
        }, 530)
        return () => clearInterval(interval)
    }, [])

    const tokenColors: Record<string, string> = {
        keyword: 'text-purple-400',
        string: 'text-green-400',
        tag: 'text-blue-400',
        component: 'text-yellow-300',
        function: 'text-yellow-300',
        attr: 'text-sky-300',
        expression: 'text-amber-300',
        plain: 'text-gray-300',
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="shadow-2xl border border-white/10 rounded-xl overflow-hidden" style={{ background: '#1e1e2e' }}>
                {/* VS Code-like title bar */}
                <div className="flex items-center px-4 py-2.5 border-b border-white/5" style={{ background: '#181825' }}>
                    <div className="flex gap-1.5 mr-4">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-t-md text-xs" style={{ background: '#1e1e2e', color: '#cdd6f4' }}>
                        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-blue-400" fill="currentColor">
                            <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9s-1.17 0-1.71.03c-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03s1.17 0 1.71-.03c.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 012.4-.36c.48-.67.99-1.31 1.51-1.9z" />
                        </svg>
                        layout.tsx
                    </div>
                </div>

                {/* Code area */}
                <div className="p-4 font-mono text-[11px] sm:text-xs leading-5 min-h-[280px] overflow-hidden">
                    {codeLines.map((line, i) => (
                        <div
                            key={i}
                            className="flex transition-all duration-200"
                            style={{
                                opacity: i < visibleLines ? 1 : 0,
                                transform: i < visibleLines ? 'translateY(0)' : 'translateY(6px)',
                            }}
                        >
                            <span className="w-6 text-right mr-4 select-none" style={{ color: '#585b70' }}>
                                {i + 1}
                            </span>
                            <span style={{ paddingLeft: `${line.indent * 16}px` }}>
                                {line.tokens.map((token, j) => (
                                    <span key={j} className={tokenColors[token.type]}>
                                        {token.text}
                                    </span>
                                ))}
                                {i === visibleLines - 1 && (
                                    <span
                                        className="inline-block w-[6px] h-[14px] ml-0.5 align-middle"
                                        style={{
                                            background: cursorVisible ? '#cdd6f4' : 'transparent',
                                            transition: 'background 0.1s',
                                        }}
                                    />
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Launch Animation - Multi-phase deployment → iPhone mockup
function LaunchAnimation({ isActive }: { isActive: boolean }) {
    const [completedTasks, setCompletedTasks] = useState(0)
    const [showMockup, setShowMockup] = useState(false)
    const wasActiveRef = useRef(false)

    const deploymentTasks = [
        { label: 'Setting up domain', icon: '🌐' },
        { label: 'DNS propagating', icon: '📡' },
        { label: 'Provisioning SSL certificate', icon: '🔒' },
        { label: 'Building production bundle', icon: '📦' },
        { label: 'Optimizing assets', icon: '⚡' },
        { label: 'Deploying to edge network', icon: '🚀' },
        { label: 'Indexing content', icon: '📄' },
        { label: 'Google bots crawling', icon: '🤖' },
    ]

    useEffect(() => {
        if (!isActive) {
            // Delay the reset so the step card fades out (opacity 0.3) before we reset.
            // This prevents the user from seeing the phone→card reverse transition.
            const delay = wasActiveRef.current ? 600 : 0
            wasActiveRef.current = false

            const resetTimeout = setTimeout(() => {
                setCompletedTasks(0)
                setShowMockup(false)
            }, delay)

            return () => clearTimeout(resetTimeout)
        }

        wasActiveRef.current = true

        const timeouts: NodeJS.Timeout[] = []
        deploymentTasks.forEach((_, i) => {
            const timeout = setTimeout(() => {
                setCompletedTasks(i + 1)
            }, 400 + i * 450)
            timeouts.push(timeout)
        })

        // After all tasks: boom → show mockup
        const mockupTimeout = setTimeout(() => {
            setShowMockup(true)
        }, 400 + deploymentTasks.length * 450 + 400)
        timeouts.push(mockupTimeout)

        return () => timeouts.forEach(clearTimeout)
    }, [isActive])

    // Fixed height that matches the deployment card height
    const CONTAINER_HEIGHT = 650

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Fixed height, overflow visible so glow isn't clipped */}
            <div className="relative" style={{ height: `${CONTAINER_HEIGHT}px` }}>
                <AnimatePresence mode="wait">
                    {!showMockup ? (
                        <motion.div
                            key="deployment"
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-card shadow-2xl border rounded-2xl overflow-hidden"
                        >
                            <div className="bg-muted/50 px-5 py-4 border-b">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"
                                        animate={completedTasks === deploymentTasks.length ? { rotate: [0, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Rocket className="w-5 h-5 text-primary" />
                                    </motion.div>
                                    <div>
                                        <p className="font-bold text-foreground">Deploying</p>
                                        <p className="text-xs text-muted-foreground">
                                            {completedTasks < deploymentTasks.length
                                                ? `${completedTasks}/${deploymentTasks.length} tasks complete`
                                                : 'All systems go!'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 space-y-2">
                                {deploymentTasks.map((task, i) => {
                                    const isComplete = i < completedTasks
                                    const isRunning = i === completedTasks && completedTasks < deploymentTasks.length

                                    return (
                                        <motion.div
                                            key={task.label}
                                            className="flex items-center gap-3 py-2 px-3 rounded-lg"
                                            initial={{ opacity: 0.4 }}
                                            animate={{
                                                opacity: isComplete || isRunning ? 1 : 0.4,
                                            }}
                                            style={{
                                                backgroundColor: isRunning ? 'rgba(86, 53, 240, 0.04)' : 'transparent',
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Status indicator */}
                                            <div className="w-6 h-6 flex items-center justify-center shrink-0">
                                                {isComplete ? (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                    >
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    </motion.div>
                                                ) : isRunning ? (
                                                    <motion.div
                                                        className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent"
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                                                    />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />
                                                )}
                                            </div>

                                            {/* Task icon & label */}
                                            <span className="text-sm mr-1">{task.icon}</span>
                                            <span className={`text-sm font-medium transition-colors duration-300 ${isComplete ? 'text-foreground' : isRunning ? 'text-primary' : 'text-muted-foreground'
                                                }`}>
                                                {task.label}
                                                {isRunning && (
                                                    <motion.span
                                                        className="inline-block ml-0.5"
                                                        animate={{ opacity: [1, 0, 1] }}
                                                        transition={{ duration: 1.2, repeat: Infinity }}
                                                    >
                                                        ...
                                                    </motion.span>
                                                )}
                                            </span>

                                            {/* Completion time */}
                                            {isComplete && (
                                                <motion.span
                                                    className="ml-auto text-xs text-muted-foreground"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                >
                                                    ✓
                                                </motion.span>
                                            )}
                                        </motion.div>
                                    )
                                })}

                                {/* Progress bar at bottom */}
                                <div className="pt-3">
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                            animate={{ width: `${(completedTasks / deploymentTasks.length) * 100}%` }}
                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="mockup"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20, duration: 0.6 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            {/* Celebration burst */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                initial={{ opacity: 1 }}
                                animate={{ opacity: 0 }}
                                transition={{ duration: 1.5, delay: 0.2 }}
                            >
                                {[...Array(8)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-2 h-2 rounded-full bg-primary"
                                        style={{
                                            left: '50%',
                                            top: '50%',
                                        }}
                                        initial={{ scale: 0, x: 0, y: 0 }}
                                        animate={{
                                            scale: [0, 1.5, 0],
                                            x: Math.cos((i * Math.PI * 2) / 8) * 100,
                                            y: Math.sin((i * Math.PI * 2) / 8) * 100,
                                        }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                    />
                                ))}
                            </motion.div>

                            {/* Hero3D component scaled to fit the fixed container */}
                            <div className="relative scale-[0.65] origin-center">
                                <Hero3D />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
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
            className="relative py-16 lg:py-28"
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
