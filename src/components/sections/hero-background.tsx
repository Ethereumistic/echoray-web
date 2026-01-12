"use client"

import React from "react"
import { motion } from "framer-motion"
import {
    Code2, Cpu, Globe2, Database, Layers, Shield, Zap,
    Cloud, Laptop, Smartphone, Rocket, Search, Terminal,
    Workflow, Network, Container
} from "lucide-react"

const icons = [
    Code2, Cpu, Globe2, Database, Layers, Shield, Zap,
    Cloud, Laptop, Smartphone, Rocket, Search, Terminal,
    Workflow, Network, Container
]

const Sphere = ({ color, size, initialX, initialY, duration }: {
    color: string,
    size: string,
    initialX: string,
    initialY: string,
    duration: number
}) => {
    return (
        <motion.div
            className="absolute rounded-full blur-[6.25rem] opacity-20 pointer-events-none"
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                left: initialX,
                top: initialY,
            }}
            animate={{
                x: ["-3.75rem", "3.75rem", "-3.75rem"],
                y: ["-2.5rem", "2.5rem", "-2.5rem"],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    )
}

/**
 * --- MATHEMATICAL SYMMETRY ---
 * Generates an arched path configuration that is perfectly symmetric.
 */
const createSymmetricPath = (yBase: number, archIntensity: number) => {
    //getY: (x) => yBase + intensity * sin(pi * x / 1000)
    // Values peak at x=500 (center)
    const getY = (x: number) => {
        const arch = Math.sin((x / 1000) * Math.PI) * archIntensity
        return yBase + arch
    }

    const points = Array.from({ length: 101 }, (_, i) => {
        const x = i * 10
        return `${x},${getY(x)}`
    }).join(" L ")

    return {
        path: `M ${points}`,
        getY
    }
}

const TracingLine = ({ path, delay, duration, reverse = false, totalCycle }: {
    path: string,
    delay: number,
    duration: number,
    reverse?: boolean,
    totalCycle: number
}) => {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            {/* --- STATIC BASE LINE --- */}
            <path
                d={path}
                stroke="var(--primary)"
                strokeWidth="1"
                fill="none"
                opacity="0.08"
            />

            {/* --- HIGH-INTENSITY TRACING BEAM (WIDER GLOW) --- */}
            <motion.path
                d={path}
                stroke="var(--primary)"
                strokeWidth="3"
                fill="none"
                initial={{
                    pathLength: 0.12,
                    pathOffset: reverse ? 1 : -0.12,
                    opacity: 0
                }}
                animate={{
                    pathOffset: reverse ? -0.12 : 1,
                    opacity: [0, 0.4, 0.4, 0]
                }}
                transition={{
                    pathOffset: {
                        duration: duration,
                        repeat: Infinity,
                        repeatDelay: totalCycle - duration,
                        delay: delay,
                        ease: "linear"
                    },
                    opacity: {
                        duration: duration,
                        times: [0, 0.05, 0.95, 1],
                        repeat: Infinity,
                        repeatDelay: totalCycle - duration,
                        delay: delay,
                        ease: "linear"
                    }
                }}
                style={{
                    filter: "blur(0.5rem) brightness(1.5)",
                }}
            />

            {/* --- PRIMARY COLOR BEAM --- */}
            <motion.path
                d={path}
                stroke="var(--primary)"
                strokeWidth="1"
                fill="none"
                initial={{
                    pathLength: 0.12,
                    pathOffset: reverse ? 1 : -0.12,
                    opacity: 0
                }}
                animate={{
                    pathOffset: reverse ? -0.12 : 1,
                    opacity: [0, 1, 1, 0]
                }}
                transition={{
                    pathOffset: {
                        duration: duration,
                        repeat: Infinity,
                        repeatDelay: totalCycle - duration,
                        delay: delay,
                        ease: "linear"
                    },
                    opacity: {
                        duration: duration,
                        times: [0, 0.05, 0.95, 1],
                        repeat: Infinity,
                        repeatDelay: totalCycle - duration,
                        delay: delay,
                        ease: "linear"
                    }
                }}
                style={{
                    filter: "drop-shadow(0 0 0.5rem var(--primary))",
                }}
            />

        </svg>
    )
}

const TechBubble = ({ Icon, x, y, duration, delay, totalCycle, reverse = false }: {
    Icon: any,
    x: number,
    y: number,
    duration: number,
    delay: number,
    totalCycle: number,
    reverse?: boolean
}) => {
    const progress = x / 1000

    // Precise timing: head reaches progress at (dist / total_dist) * duration
    // total_dist is 1 + pathLength = 1.12
    const timeAtX = reverse
        ? ((1 - progress) / 1.12) * duration
        : (progress / 1.12) * duration

    // Duration the 0.12 length tracer spends over a single point
    const glowDuration = (0.12 / 1.12) * duration

    // Pulse peak timing (sync with streak)
    let pulseDelay = (delay + timeAtX) % totalCycle
    if (pulseDelay < 0) pulseDelay += totalCycle

    return (
        <div
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
                left: `${x / 10}%`,
                top: `${y / 10}%`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* --- REACTIVE GLOW PULSE --- */}
            <motion.div
                className="absolute inset-0 rounded-full bg-primary/40 blur-[1.5rem]"
                animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0.8, 1.8, 0.8]
                }}
                transition={{
                    duration: glowDuration,
                    repeat: Infinity,
                    repeatDelay: totalCycle - glowDuration,
                    delay: pulseDelay,
                    times: [0, 0.1, 0.9, 1]
                }}
            />

            {/* --- BUBBLE CONTAINER --- */}
            <div className="relative flex items-center justify-center w-[3rem] h-[3rem] rounded-full border border-primary/20 bg-background/60 backdrop-blur-[2rem] shadow-[0_0_1.5rem_rgba(var(--primary),0.1)]">
                <Icon className="w-[1.25rem] h-[1.25rem] text-primary brightness-110" />
            </div>
        </div>
    )
}

export function HeroBackground() {
    const T_DURATION = 60
    const TOTAL_CYCLE = T_DURATION * 3

    // 3 Perfectly Symmetric Arched Paths (Using Rem Concept for Base Levels)
    // 1. Top Arch: Arches UP away from text
    const track1 = createSymmetricPath(320, -120)
    // 2. Middle Arch: Arches through the main heading
    const track2 = createSymmetricPath(500, 30)
    // 3. Bottom Arch: Arches DOWN between subtext and buttons
    const track3 = createSymmetricPath(720, 140)

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
            {/* --- PRIMARY BLUE SPHERES --- */}
            <Sphere color="var(--primary)" size="62.5rem" initialX="-15%" initialY="10%" duration={25} />
            <Sphere color="var(--primary)" size="50rem" initialX="65%" initialY="-5%" duration={30} />
            <Sphere color="var(--primary)" size="75rem" initialX="15%" initialY="55%" duration={35} />

            {/* --- TRACING LINES (SEQUENTIAL) --- */}
            <TracingLine path={track1.path} delay={0} duration={T_DURATION} totalCycle={TOTAL_CYCLE} />
            <TracingLine path={track2.path} delay={T_DURATION} duration={T_DURATION} totalCycle={TOTAL_CYCLE} reverse />
            <TracingLine path={track3.path} delay={T_DURATION * 2} duration={T_DURATION} totalCycle={TOTAL_CYCLE} />

            {/* --- TECH ICONS (Symmetric Pairs) --- */}

            {/* Track 1: High sides */}
            <TechBubble Icon={icons[0]} x={150} y={track1.getY(150)} duration={T_DURATION} delay={0} totalCycle={TOTAL_CYCLE} />
            <TechBubble Icon={icons[4]} x={850} y={track1.getY(850)} duration={T_DURATION} delay={0} totalCycle={TOTAL_CYCLE} />

            {/* Track 2: Mid sides */}
            <TechBubble Icon={icons[1]} x={80} y={track2.getY(80)} duration={T_DURATION} delay={T_DURATION} totalCycle={TOTAL_CYCLE} reverse />
            <TechBubble Icon={icons[6]} x={920} y={track2.getY(920)} duration={T_DURATION} delay={T_DURATION} totalCycle={TOTAL_CYCLE} reverse />

            {/* Track 3: Low sides */}
            <TechBubble Icon={icons[5]} x={180} y={track3.getY(180)} duration={T_DURATION} delay={T_DURATION * 2} totalCycle={TOTAL_CYCLE} />
            <TechBubble Icon={icons[15]} x={820} y={track3.getY(820)} duration={T_DURATION} delay={T_DURATION * 2} totalCycle={TOTAL_CYCLE} />

            {/* --- ARCHITECTURAL GRID --- */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                <div className="h-full w-full" style={{
                    backgroundImage: 'linear-gradient(to right, var(--primary) 1px, transparent 1px), linear-gradient(to bottom, var(--primary) 1px, transparent 1px)',
                    backgroundSize: '6.25rem 6.25rem'
                }} />
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/20 to-background" />
        </div>
    )
}
