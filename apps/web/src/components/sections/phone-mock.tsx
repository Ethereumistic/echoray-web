"use client"

import { useRef, useState, useEffect } from "react"
import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
    useMotionTemplate,
    AnimatePresence,
} from "framer-motion"

const DEFAULT_IMAGES = [
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/stars.guide.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/danirusev.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/dbproductions.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/global-travel.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/ultrabuild.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/m-texx.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/bio-ddd.webp",
    "https://cdn.jsdelivr.net/gh/Ethereumistic/echo-ray-assets/mock/en/global-travel.webp",
]

interface PhoneMockProps {
    imageSrc?: string
    alt?: string
}

export function PhoneMock({ imageSrc, alt = "Website preview" }: PhoneMockProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    
    const images = imageSrc ? [imageSrc] : DEFAULT_IMAGES

    useEffect(() => {
        if (imageSrc) return
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 6000)
        return () => clearInterval(interval)
    }, [imageSrc, images.length])

    const x = useMotionValue(0)
    const y = useMotionValue(0)

    const mouseXSpring = useSpring(x)
    const mouseYSpring = useSpring(y)

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"])
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"])

    const translateX = useTransform(mouseXSpring, [-0.5, 0.5], ["-20px", "20px"])
    const translateY = useTransform(mouseYSpring, [-0.5, 0.5], ["20px", "-20px"])

    const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100])
    const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100])

    const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.9) 10%, rgba(255, 255, 255, 0.75) 20%, rgba(255, 255, 255, 0) 80%)`

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return

        const rect = ref.current.getBoundingClientRect()
        const width = rect.width
        const height = rect.height

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        const xPct = mouseX / width - 0.5
        const yPct = mouseY / height - 0.5

        x.set(xPct)
        y.set(yPct)
    }

    const handleMouseLeave = () => {
        x.set(0)
        y.set(0)
    }

    return (
        <div className="relative w-full flex items-center justify-center perspective-distant overflow-visible">
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative rounded-[2.5rem] overflow-visible"
                style={{
                    rotateX,
                    rotateY,
                    translateX,
                    translateY,
                    transformStyle: "preserve-3d",
                    boxShadow:
                        "rgba(0, 0, 0, 0.3) 0px 20px 40px -10px, rgba(0, 0, 0, 0.2) 0px 10px 20px -10px",
                }}
                initial={{ scale: 1, opacity: 0, z: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{
                    scale: 1.05,
                    z: 50,
                    transition: { duration: 0.2 },
                }}
            >
                <div className="relative w-[280px] h-[580px] rounded-[2.5rem] overflow-hidden">
                    <AnimatePresence>
                        <motion.img
                            key={images[currentIndex]}
                            loading="lazy"
                            className="h-full w-full object-cover absolute inset-0"
                            alt={alt}
                            src={images[currentIndex]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                    </AnimatePresence>
                </div>

                <motion.div
                    className="pointer-events-none absolute inset-0 h-full w-full rounded-[2.5rem] mix-blend-overlay"
                    style={{
                        background: glareBackground,
                        opacity: 0.6,
                    }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>

            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 blur-2xl -z-10 pointer-events-none"
                animate={{
                    opacity: [0.3, 0.5, 0.3],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

        </div>
    )
}
