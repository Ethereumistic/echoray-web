"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Sun,
    ChevronRight,
    ChevronUp,
    ChevronLeft,
    ChevronDown,
    Mic,
    Moon,
    StepForward,
    SkipBack,
    SkipForward,
    Table2,
    Volume2,
    Volume1,
    VolumeX,
    Search,
    Globe,
    Command,
} from "lucide-react";
import Image from "next/image";


export const MacbookScroll = ({
    src,
    showGradient,
    title,
    badge,
    children,
}: {
    src?: string;
    showGradient?: boolean;
    title?: string | React.ReactNode;
    badge?: React.ReactNode;
    children?: React.ReactNode;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const [isMobile, setIsMobile] = useState(false);
    const [debugInfo, setDebugInfo] = useState({
        progress: 0,
        startY: 0,
        endY: 0,
        currentY: 0,
    });

    useEffect(() => {
        if (window && window.innerWidth < 768) {
            setIsMobile(true);
        }
    }, []);

    // Debug: Track scroll progress and positions
    useEffect(() => {
        const updateDebug = () => {
            if (ref.current) {
                const rect = ref.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const startY = rect.top + window.scrollY;
                const endY = startY + rect.height;
                const currentY = window.scrollY;

                // Calculate progress (0 to 1)
                const totalScroll = rect.height - windowHeight;
                const scrolled = currentY - (startY - windowHeight);
                const progress = Math.max(0, Math.min(1, scrolled / totalScroll));

                setDebugInfo({
                    progress: Math.round(progress * 100),
                    startY: Math.round(startY),
                    endY: Math.round(endY),
                    currentY: Math.round(currentY),
                });
            }
        };

        window.addEventListener("scroll", updateDebug, { passive: true });
        updateDebug();

        return () => window.removeEventListener("scroll", updateDebug);
    }, []);

    const scaleX = useTransform(
        scrollYProgress,
        [0, 0.3],
        [1.2, isMobile ? 1 : 1.5],
    );
    const scaleY = useTransform(
        scrollYProgress,
        [0, 0.3],
        [0.6, isMobile ? 1 : 1.5],
    );
    const translate = useTransform(scrollYProgress, [0, 1], [0, isMobile ? 800 : 800]);
    const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
    const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    // ============================================
    // CTA CONTENT POP-OUT ANIMATION CONTROLS
    // ============================================
    // 
    // These transforms control how the CTA content inside the MacBook screen
    // behaves as the user scrolls. The scrollYProgress goes from 0 (top) to 1 (bottom).
    //
    // 🎯 CURRENT TIMING BREAKDOWN (using [0.6, 0.8, 1]):
    // - 0% to 60% scroll:   MacBook fully visible, CTA stays normal (1x)
    // - 60% to 80% scroll:  CTA starts growing (1x → 2x) - beginning to pop out  
    // - 80% to 100% scroll: CTA reaches full size (2x → 3.5x) - fully enlarged
    //
    // 🕐 To adjust WHEN the enlargement starts:
    // - Change the FIRST value in the array [0.6, 0.8, 1]
    // - Higher = starts LATER (e.g., 0.7 = 70% scroll) - MacBook visible longer
    // - Lower = starts EARLIER (e.g., 0.5 = 50% scroll) - pops out sooner
    //
    // 📏 To adjust HOW BIG it gets:
    // - Change the LAST value in [1, 2, 3.5]
    // - Higher number = BIGGER final size
    // - Lower number = SMALLER final size
    // 
    // 💡 TIP: If the CTA becomes too big and pixelated/blurry, reduce this
    // 3.5x = 350% size (quite large), 2x = 200% size (moderate)
    const contentScale = useTransform(scrollYProgress, [0.2, 0.8, 1], [1, 1, 1.5]);

    // CONTENT Z-DEPTH (3D forward movement)
    // This moves the CTA forward in 3D space toward the viewer using translateZ
    // - 0px = flat against the screen (no 3D depth)
    // - 300px = appears to float significantly in front of the laptop
    // 
    // HIGHER VALUES = more dramatic "pop out" effect
    // LOWER VALUES = stays flatter, closer to the screen
    // 
    // 💡 TIP: If the CTA looks "detached" or floating weirdly, reduce this value
    const contentTranslateZ = useTransform(scrollYProgress, [0.2, 0.8, 1], [0, 300, 500]);

    // CONTENT VERTICAL POSITION (Y-axis)
    // 
    // ⚠️  TRICKY: This transform interacts with the parent's scale transform!
    // The parent lid has `transformOrigin: "top"`, meaning it scales from the TOP edge.
    // When the CTA scales up 3.5x, it grows DOWNWARD, making it appear LOWER naturally.
    // 
    // HOW IT WORKS:
    // - Positive translateY = moves content DOWN (lower on screen)
    // - Negative translateY = moves content UP (higher on screen)
    // - BUT: The scaling effect is STRONGER than the translate effect
    //
    // EXAMPLE VALUES & RESULTS:
    // [0, 25, 150]  → Scales down+right, appears LOWER on screen
    // [0, -50, -100] → Scales up+right, appears HIGHER on screen
    // [0, 0, 0]      → Scales from center, appears in middle
    //
    // 💡 PRO TIP: To move the CTA LOWER, use POSITIVE values (like 150)
    // The scaling will still make it grow, but the positive translate 
    // pushes it downward in the viewport
    const contentTranslateY = useTransform(scrollYProgress, [0.2, 0.8, 1], [0, 170, 350]);

    return (
        <div
            ref={ref}
            className="flex min-h-[200vh] shrink-0 scale-[0.35] transform flex-col items-center justify-start py-0 [perspective:800px] sm:scale-50 md:scale-100 md:py-80"
        >


            <motion.h2
                style={{
                    translateY: textTransform,
                    opacity: textOpacity,
                }}
                className="mb-20 text-4xl md:text-5xl font-bold tracking-tight text-center"
            >
                {title || (
                    <span>
                        This Macbook is built with Tailwindcss. <br /> No kidding.
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                            Ready to grow your business online?
                        </h2>
                    </span>
                )}
            </motion.h2>
            {/* Lid */}
            <Lid
                src={src}
                scaleX={scaleX}
                scaleY={scaleY}
                rotate={rotate}
                translate={translate}
                contentScale={contentScale}
                contentTranslateZ={contentTranslateZ}
                contentTranslateY={contentTranslateY}
            >
                {children}
            </Lid>
            {/* Base area */}
            <div className="relative -z-10 h-[22rem] w-[32rem] overflow-hidden rounded-2xl dark:bg-[#272729]">
                {/* above keyboard bar */}
                <div className="relative h-10 w-full">
                    <div className="absolute inset-x-0 mx-auto h-4 w-[80%]" />
                </div>
                <div className="relative flex">
                    <div className="mx-auto h-full w-[10%] overflow-hidden">
                        <SpeakerGrid />
                    </div>
                    <div className="mx-auto h-full w-[80%]">
                        <Keypad />
                    </div>
                    <div className="mx-auto h-full w-[10%] overflow-hidden">
                        <SpeakerGrid />
                    </div>
                </div>
                <Trackpad />
                <div className="absolute inset-x-0 bottom-0 mx-auto h-2 w-20 rounded-tl-3xl rounded-tr-3xl bg-gradient-to-t from-[#272729] to-[#050505]" />
                {showGradient && (
                    <div className="absolute inset-x-0 bottom-0 z-50 h-40 w-full bg-gradient-to-t from-white via-white to-transparent dark:from-black dark:via-black"></div>
                )}
                {badge && <div className="absolute bottom-4 left-4">{badge}</div>}
            </div>
        </div>
    );
};

export const Lid = ({
    scaleX,
    scaleY,
    rotate,
    translate,
    src,
    children,
    contentScale,
    contentTranslateZ,
    contentTranslateY,
}: {
    scaleX: MotionValue<number>;
    scaleY: MotionValue<number>;
    rotate: MotionValue<number>;
    translate: MotionValue<number>;
    src?: string;
    children?: React.ReactNode;
    contentScale?: MotionValue<number>;
    contentTranslateZ?: MotionValue<number>;
    contentTranslateY?: MotionValue<number>;
}) => {
    return (
        <div className="relative [perspective:800px]">
            <div
                style={{
                    transform: "perspective(800px) rotateX(-25deg) translateZ(0px)",
                    transformOrigin: "bottom",
                    transformStyle: "preserve-3d",
                }}
                className="relative h-[12rem] w-[32rem] rounded-2xl bg-[#010101] p-2"
            >
                <div
                    style={{
                        boxShadow: "0px 2px 0px 2px #171717 inset",
                    }}
                    className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#010101]"
                >
                    <span className="text-white">
                        <LidLogo />
                    </span>
                </div>
            </div>
            <motion.div
                style={{
                    scaleX: scaleX,
                    scaleY: scaleY,
                    rotateX: rotate,
                    translateY: translate,
                    transformStyle: "preserve-3d",
                    transformOrigin: "top",
                }}
                className="absolute inset-0 h-80 w-[32rem] rounded-2xl p-2 overflow-hidden"
            >
                {/* Tuka otgore ako imame overflow-hidden, pochva da krie CTA-to zad neshto si tam. */}

                {/* Tuka e frame okolo CTA */}
                <div className="absolute inset-0 rounded-lg " />
                {children ? (
                    <motion.div
                        className="absolute inset-0 h-full w-full rounded-lg overflow-auto"
                        style={{
                            scale: contentScale,
                            translateZ: contentTranslateZ,
                            translateY: contentTranslateY,
                            transformStyle: "preserve-3d",
                        }}
                    >
                        {children}
                    </motion.div>
                ) : (
                    <img
                        src={src as string}
                        alt="Echoray call to action image"
                        className="absolute inset-0 h-full w-full rounded-lg object-cover object-left-top"
                    />
                )}
            </motion.div>
        </div>
    );
};

export const Trackpad = () => {
    return (
        <div
            className="mx-auto my-1 h-32 w-[40%] rounded-xl"
            style={{
                boxShadow: "0px 0px 1px 1px #00000020 inset",
            }}
        ></div>
    );
};

export const Keypad = () => {
    return (
        <div className="relative h-full w-[115%] -translate-x-[4.5%] -left-[2.5%] [transform:translateZ(0)] rounded-md bg-[#050505] p-1 [will-change:transform]">
            {/* First Row */}
            <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                <KBtn
                    className="w-10 items-end justify-start pb-[2px] pl-[4px]"
                    childrenClassName="items-start"
                >
                    esc
                </KBtn>
                <KBtn>
                    <Sun className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F1</span>
                </KBtn>
                <KBtn>
                    <Sun className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F2</span>
                </KBtn>
                <KBtn>
                    <Table2 className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F3</span>
                </KBtn>
                <KBtn>
                    <Search className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F4</span>
                </KBtn>
                <KBtn>
                    <Mic className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F5</span>
                </KBtn>
                <KBtn>
                    <Moon className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F6</span>
                </KBtn>
                <KBtn>
                    <SkipBack className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F7</span>
                </KBtn>
                <KBtn>
                    <StepForward className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F8</span>
                </KBtn>
                <KBtn>
                    <SkipForward className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F8</span>
                </KBtn>
                <KBtn>
                    <VolumeX className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F10</span>
                </KBtn>
                <KBtn>
                    <Volume1 className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F11</span>
                </KBtn>
                <KBtn>
                    <Volume2 className="h-[6px] w-[6px]" />
                    <span className="mt-1 inline-block">F12</span>
                </KBtn>
                <KBtn>
                    <div className="h-4 w-4 rounded-full bg-gradient-to-b from-neutral-900 from-20% via-black via-50% to-neutral-900 to-95% p-px">
                        <div className="h-full w-full rounded-full bg-black" />
                    </div>
                </KBtn>
            </div>

            {/* Second row */}
            <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                <KBtn>
                    <span className="block">~</span>
                    <span className="mt-1 block">`</span>
                </KBtn>
                <KBtn>
                    <span className="block">!</span>
                    <span className="block">1</span>
                </KBtn>
                <KBtn>
                    <span className="block">@</span>
                    <span className="block">2</span>
                </KBtn>
                <KBtn>
                    <span className="block">#</span>
                    <span className="block">3</span>
                </KBtn>
                <KBtn>
                    <span className="block">$</span>
                    <span className="block">4</span>
                </KBtn>
                <KBtn>
                    <span className="block">%</span>
                    <span className="block">5</span>
                </KBtn>
                <KBtn>
                    <span className="block">^</span>
                    <span className="block">6</span>
                </KBtn>
                <KBtn>
                    <span className="block">&</span>
                    <span className="block">7</span>
                </KBtn>
                <KBtn>
                    <span className="block">*</span>
                    <span className="block">8</span>
                </KBtn>
                <KBtn>
                    <span className="block">(</span>
                    <span className="block">9</span>
                </KBtn>
                <KBtn>
                    <span className="block">)</span>
                    <span className="block">0</span>
                </KBtn>
                <KBtn>
                    <span className="block">&mdash;</span>
                    <span className="block">_</span>
                </KBtn>
                <KBtn>
                    <span className="block">+</span>
                    <span className="block"> = </span>
                </KBtn>
                <KBtn
                    className="w-10 items-end justify-end pr-[4px] pb-[2px]"
                    childrenClassName="items-end"
                >
                    delete
                </KBtn>
            </div>

            {/* Third row */}
            <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                <KBtn
                    className="w-10 items-end justify-start pb-[2px] pl-[4px]"
                    childrenClassName="items-start"
                >
                    tab
                </KBtn>
                <KBtn>
                    <span className="block">Q</span>
                </KBtn>
                <KBtn>
                    <span className="block">W</span>
                </KBtn>
                <KBtn>
                    <span className="block">E</span>
                </KBtn>
                <KBtn>
                    <span className="block">R</span>
                </KBtn>
                <KBtn>
                    <span className="block">T</span>
                </KBtn>
                <KBtn>
                    <span className="block">Y</span>
                </KBtn>
                <KBtn>
                    <span className="block">U</span>
                </KBtn>
                <KBtn>
                    <span className="block">I</span>
                </KBtn>
                <KBtn>
                    <span className="block">O</span>
                </KBtn>
                <KBtn>
                    <span className="block">P</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`{`}</span>
                    <span className="block">{`[`}</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`}`}</span>
                    <span className="block">{`]`}</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`|`}</span>
                    <span className="block">{`\\`}</span>
                </KBtn>
            </div>

            {/* Fourth Row */}
            <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                <KBtn
                    className="w-[2.8rem] items-end justify-start pb-[2px] pl-[4px]"
                    childrenClassName="items-start"
                >
                    caps lock
                </KBtn>
                <KBtn>
                    <span className="block">A</span>
                </KBtn>
                <KBtn>
                    <span className="block">S</span>
                </KBtn>
                <KBtn>
                    <span className="block">D</span>
                </KBtn>
                <KBtn>
                    <span className="block">F</span>
                </KBtn>
                <KBtn>
                    <span className="block">G</span>
                </KBtn>
                <KBtn>
                    <span className="block">H</span>
                </KBtn>
                <KBtn>
                    <span className="block">J</span>
                </KBtn>
                <KBtn>
                    <span className="block">K</span>
                </KBtn>
                <KBtn>
                    <span className="block">L</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`:`}</span>
                    <span className="block">{`;`}</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`"`}</span>
                    <span className="block">{`'`}</span>
                </KBtn>
                <KBtn
                    className="w-[4rem] items-end justify-end pr-[4px] pb-[2px]"
                    childrenClassName="items-end"
                >
                    return
                </KBtn>
            </div>

            {/* Fifth Row */}
            <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                <KBtn
                    className="w-[4.4rem] items-end justify-start pb-[2px] pl-[4px]"
                    childrenClassName="items-start"
                >
                    shift
                </KBtn>
                <KBtn>
                    <span className="block">Z</span>
                </KBtn>
                <KBtn>
                    <span className="block">X</span>
                </KBtn>
                <KBtn>
                    <span className="block">C</span>
                </KBtn>
                <KBtn>
                    <span className="block">V</span>
                </KBtn>
                <KBtn>
                    <span className="block">B</span>
                </KBtn>
                <KBtn>
                    <span className="block">N</span>
                </KBtn>
                <KBtn>
                    <span className="block">M</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`<`}</span>
                    <span className="block">{`,`}</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`>`}</span>
                    <span className="block">{`.`}</span>
                </KBtn>
                <KBtn>
                    <span className="block">{`?`}</span>
                    <span className="block">{`/`}</span>
                </KBtn>
                <KBtn
                    className="w-[4.4rem] items-end justify-end pr-[4px] pb-[2px]"
                    childrenClassName="items-end"
                >
                    shift
                </KBtn>
            </div>

            {/* sixth Row */}
            <div className="mb-[2px] flex w-full shrink-0 gap-[2px]">
                <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
                    <div className="flex w-full justify-end pr-1">
                        <span className="block">fn</span>
                    </div>
                    <div className="flex w-full justify-start pl-1">
                        <Globe className="h-[6px] w-[6px]" />
                    </div>
                </KBtn>
                <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
                    <div className="flex w-full justify-end pr-1">
                        <ChevronUp className="h-[6px] w-[6px]" />
                    </div>
                    <div className="flex w-full justify-start pl-1">
                        <span className="block">control</span>
                    </div>
                </KBtn>
                <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
                    <div className="flex w-full justify-end pr-1">
                        <OptionKey className="h-[6px] w-[6px]" />
                    </div>
                    <div className="flex w-full justify-start pl-1">
                        <span className="block">option</span>
                    </div>
                </KBtn>
                <KBtn
                    className="w-8"
                    childrenClassName="h-full justify-between py-[4px]"
                >
                    <div className="flex w-full justify-end pr-1">
                        <Command className="h-[6px] w-[6px]" />
                    </div>
                    <div className="flex w-full justify-start pl-1">
                        <span className="block">command</span>
                    </div>
                </KBtn>
                <KBtn className="w-[10rem]"></KBtn>
                <KBtn
                    className="w-8"
                    childrenClassName="h-full justify-between py-[4px]"
                >
                    <div className="flex w-full justify-start pl-1">
                        <Command className="h-[6px] w-[6px]" />
                    </div>
                    <div className="flex w-full justify-start pl-1">
                        <span className="block">command</span>
                    </div>
                </KBtn>
                <KBtn className="" childrenClassName="h-full justify-between py-[4px]">
                    <div className="flex w-full justify-start pl-1">
                        <OptionKey className="h-[6px] w-[6px]" />
                    </div>
                    <div className="flex w-full justify-start pl-1">
                        <span className="block">option</span>
                    </div>
                </KBtn>
                <div className="mt-[2px] flex translate-x-[0.75rem] h-6 w-[4.2rem] flex-col items-center justify-end rounded-[4px] bg-[#050505] p-[0.5px]">
                    <KBtn className="h-3 w-6">
                        <ChevronUp className="h-[6px] w-[6px]" />
                    </KBtn>
                    <div className="flex">
                        <KBtn className="h-3 w-6">
                            <ChevronLeft className="h-[6px] w-[6px]" />
                        </KBtn>
                        <KBtn className="h-3 w-6">
                            <ChevronDown className="h-[6px] w-[6px]" />
                        </KBtn>
                        <KBtn className="h-3 w-6">
                            <ChevronRight className="h-[6px] w-[6px]" />
                        </KBtn>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const KBtn = ({
    className,
    children,
    childrenClassName,
    backlit = true,
}: {
    className?: string;
    children?: React.ReactNode;
    childrenClassName?: string;
    backlit?: boolean;
}) => {
    return (
        <div
            className={cn(
                "[transform:translateZ(0)] rounded-[4px] p-[0.5px] [will-change:transform]",
                backlit && "bg-white/[0.2] shadow-xl shadow-white",
            )}
        >
            <div
                className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-[3.5px] bg-[#0A090D]",
                    className,
                )}
                style={{
                    boxShadow:
                        "0px -0.5px 2px 0 #0D0D0F inset, -0.5px 0px 2px 0 #0D0D0F inset",
                }}
            >
                <div
                    className={cn(
                        "flex w-full flex-col items-center justify-center text-[5px] text-neutral-200",
                        childrenClassName,
                        backlit && "text-white",
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export const SpeakerGrid = () => {
    return (
        <div
            className="mt-2 flex h-40 gap-[2px] px-[0.5px]"
            style={{
                backgroundImage:
                    "radial-gradient(circle, #08080A 0.5px, transparent 0.5px)",
                backgroundSize: "3px 3px",
            }}
        ></div>
    );
};

export const OptionKey = ({ className }: { className: string }) => {
    return (
        <svg
            fill="none"
            version="1.1"
            id="icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            className={className}
        >
            <rect
                stroke="currentColor"
                strokeWidth={2}
                x="18"
                y="5"
                width="10"
                height="2"
            />
            <polygon
                stroke="currentColor"
                strokeWidth={2}
                points="10.6,5 4,5 4,7 9.4,7 18.4,27 28,27 28,25 19.6,25 "
            />
            <rect
                id="_Transparent_Rectangle_"
                className="st0"
                width="32"
                height="32"
                stroke="none"
            />
        </svg>
    );
};

const LidLogo = () => {
    return (
        <div className="flex items-center gap-2">
            <Image src="/logo/wifi-dark.png" alt="Echoray Logo" width={32} height={32} className="h-8 w-8 object-contain" />
            {/* <span className="text-xl font-bold tracking-tight">Echoray</span> */}
        </div>
    );
};
