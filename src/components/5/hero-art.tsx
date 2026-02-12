"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

const FloatingShape = ({
    delay,
    duration,
    size,
    initialX,
    initialY,
    color,
    blur,
}: {
    delay: number
    duration: number
    size: number
    initialX: string
    initialY: string
    color: string
    blur: number
}) => {
    return (
        <motion.div
            className="absolute rounded-full"
            style={{
                width: size,
                height: size,
                background: `radial-gradient(circle at 30% 30%, ${color}, transparent 70%)`,
                left: initialX,
                top: initialY,
                filter: `blur(${blur}px)`,
            }}
            animate={{
                x: [0, 30, -20, 0],
                y: [0, -40, 20, 0],
                scale: [1, 1.2, 0.9, 1],
            }}
            transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    )
}

const GeometricLine = ({ angle, length, delay }: { angle: number; length: number; delay: number }) => {
    const rad = (angle * Math.PI) / 180
    const x2 = Math.cos(rad) * length
    const y2 = Math.sin(rad) * length

    return (
        <motion.div
            className="absolute left-1/2 top-1/2 origin-center"
            style={{ width: 1, height: length }}
            initial={{ opacity: 0, rotate: angle }}
            animate={{ opacity: [0, 0.3, 0], scaleY: [0.5, 1, 0.5] }}
            transition={{
                duration: 3,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        >
            <div
                className="w-full h-full bg-gradient-to-b from-primary/50 via-primary/20 to-transparent"
                style={{ transform: `translateY(-50%)` }}
            />
        </motion.div>
    )
}

const PulseRing = ({ size, delay }: { size: number; delay: number }) => {
    return (
        <motion.div
            className="absolute left-1/2 top-1/2 rounded-full border border-primary/30"
            style={{
                width: size,
                height: size,
                marginLeft: -size / 2,
                marginTop: -size / 2,
            }}
            animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    )
}

const MorphingBlob = ({ delay }: { delay: number }) => {
    const [pathIndex, setPathIndex] = useState(0)

    const paths = [
        "M 0,-100 C 50,-100 100,-50 100,0 C 100,50 50,100 0,100 C -50,100 -100,50 -100,0 C -100,-50 -50,-100 0,-100",
        "M 0,-80 C 60,-90 90,-40 90,10 C 90,60 40,90 0,80 C -40,70 -90,40 -90,-10 C -90,-60 -40,-80 0,-80",
        "M 0,-90 C 40,-95 95,-30 95,20 C 95,70 30,95 0,90 C -30,85 -95,50 -95,-10 C -95,-70 -40,-90 0,-90",
        "M 0,-85 C 55,-85 85,-35 85,15 C 85,65 35,85 0,85 C -35,85 -85,45 -85,-5 C -85,-55 -45,-85 0,-85",
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setPathIndex((prev) => (prev + 1) % paths.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [paths.length])

    return (
        <motion.svg
            viewBox="-150 -150 300 300"
            className="absolute left-1/2 top-1/2 w-80 h-80 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay }}
        >
            <defs>
                <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="hsl(var(--chart-1))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
            <motion.path
                d={paths[pathIndex]}
                fill="url(#blobGradient)"
                filter="url(#glow)"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            />
        </motion.svg>
    )
}

const GlowingDot = ({ x, y, delay }: { x: string; y: string; delay: number }) => {
    return (
        <motion.div
            className="absolute w-2 h-2 rounded-full bg-primary"
            style={{ left: x, top: y }}
            animate={{
                scale: [1, 2, 1],
                opacity: [0.6, 1, 0.6],
                boxShadow: [
                    "0 0 10px hsl(var(--primary))",
                    "0 0 30px hsl(var(--primary))",
                    "0 0 10px hsl(var(--primary))",
                ],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
            }}
        />
    )
}

export function HeroArt() {
    return (
        <div className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

            <div className="absolute inset-0 opacity-[0.015]">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
                        `,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <PulseRing size={400} delay={0} />
            <PulseRing size={300} delay={0.5} />
            <PulseRing size={200} delay={1} />
            <PulseRing size={100} delay={1.5} />

            {Array.from({ length: 12 }).map((_, i) => (
                <GeometricLine key={i} angle={i * 30} length={200} delay={i * 0.2} />
            ))}

            <MorphingBlob delay={0.3} />

            <FloatingShape
                delay={0}
                duration={8}
                size={300}
                initialX="10%"
                initialY="20%"
                color="hsl(var(--primary) / 0.3)"
                blur={60}
            />
            <FloatingShape
                delay={1}
                duration={10}
                size={250}
                initialX="60%"
                initialY="60%"
                color="hsl(var(--chart-1) / 0.25)"
                blur={50}
            />
            <FloatingShape
                delay={2}
                duration={7}
                size={200}
                initialX="70%"
                initialY="15%"
                color="hsl(var(--chart-2) / 0.2)"
                blur={40}
            />

            <GlowingDot x="20%" y="30%" delay={0} />
            <GlowingDot x="80%" y="25%" delay={0.5} />
            <GlowingDot x="75%" y="70%" delay={1} />
            <GlowingDot x="25%" y="75%" delay={1.5} />
            <GlowingDot x="50%" y="20%" delay={2} />
            <GlowingDot x="50%" y="80%" delay={2.5} />

            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
                style={{
                    background: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`,
                }}
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-primary/30"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-primary" />
            </motion.div>

            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border border-chart-1/20"
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            >
                <div className="absolute -top-1 right-0 w-1.5 h-1.5 rounded-full bg-chart-1/60" />
            </motion.div>
        </div>
    )
}
