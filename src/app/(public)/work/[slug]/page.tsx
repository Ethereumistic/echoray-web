"use client"

import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Calendar, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

// ── Animation variants ─────────────────────────────────────────

const stagger = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
}

const fadeUp = {
    hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
    visible: {
        opacity: 1, y: 0, filter: "blur(0px)",
        transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    },
}

const fadeIn = {
    hidden: { opacity: 0, scale: 0.97 },
    visible: {
        opacity: 1, scale: 1,
        transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    },
}

// ── Page ────────────────────────────────────────────────────────

export default function WorkDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const router = useRouter()
    const project = useQuery(api.work.getProjectBySlug, { slug })

    // Loading
    if (project === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="size-8 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm">Loading project…</p>
                </div>
            </div>
        )
    }

    // Not found
    if (project === null) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight">Project not found</h1>
                    <p className="text-muted-foreground">This project doesn't exist or isn't published yet.</p>
                    <Button variant="outline" onClick={() => router.push("/work")} className="gap-2">
                        <ArrowLeft className="size-4" /> Back to Work
                    </Button>
                </div>
            </div>
        )
    }

    const heroImage = project.ogImage || project.thumbnail
    const launchYear = project.launchDate ? format(new Date(project.launchDate), "yyyy") : null
    const completedYear = project.completedDate ? format(new Date(project.completedDate), "MMM yyyy") : null

    return (
        <div className="min-h-screen">
            {/* ── Hero Banner ─────────────────────────────────────── */}
            <section className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden">
                {/* Background image */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.08, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: [0.25, 0.4, 0.25, 1] }}
                >
                    <img
                        src={heroImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

                {/* Back button */}
                <motion.div
                    className="absolute top-6 left-6 z-20"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 bg-background/30 backdrop-blur-md border border-white/10 hover:bg-background/50 text-white"
                        asChild
                    >
                        <Link href="/work">
                            <ArrowLeft className="size-4" /> All Work
                        </Link>
                    </Button>
                </motion.div>

                {/* Hero text overlay */}
                <motion.div
                    className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-10 z-10"
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                >
                    {project.projectType && (
                        <motion.p
                            className="text-xs font-mono uppercase tracking-widest text-primary mb-3"
                            variants={fadeUp}
                        >
                            {project.projectType}
                        </motion.p>
                    )}
                    <motion.h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] font-serif"
                        variants={fadeUp}
                    >
                        {project.title}
                    </motion.h1>
                    {project.tagline && (
                        <motion.p
                            className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl"
                            variants={fadeUp}
                        >
                            {project.tagline}
                        </motion.p>
                    )}
                </motion.div>
            </section>

            {/* ── Info Bar ────────────────────────────────────────── */}
            <motion.section
                className="border-b border-white/5"
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 }}
            >
                <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-5 flex flex-wrap items-center gap-4 md:gap-8">
                    {/* Status */}
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className={`size-4 ${project.status === "completed" ? "text-emerald-400" : "text-amber-400"}`} />
                        <span className={`font-medium uppercase text-xs tracking-wider ${project.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                            {project.status}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="h-4 w-px bg-white/10 hidden md:block" />

                    {/* Date */}
                    {(completedYear || launchYear) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="size-3.5" />
                            <span className="font-mono text-xs">{completedYear || launchYear}</span>
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Visit Site */}
                    <Button size="sm" className="gap-2 group" asChild>
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                            Visit Site
                            <ExternalLink className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                    </Button>
                </div>
            </motion.section>

            {/* ── Main Content ────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-16 md:py-24 space-y-20 md:space-y-28">

                {/* Description */}
                {project.description && (
                    <motion.section
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        <motion.h2
                            className="text-xs font-mono uppercase tracking-widest text-primary mb-6"
                            variants={fadeUp}
                        >
                            About the Project
                        </motion.h2>
                        <motion.div
                            className="max-w-3xl"
                            variants={fadeUp}
                        >
                            <p className="text-lg md:text-xl leading-relaxed text-muted-foreground whitespace-pre-line">
                                {project.description}
                            </p>
                        </motion.div>
                    </motion.section>
                )}

                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                    <motion.section
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        <motion.h2
                            className="text-xs font-mono uppercase tracking-widest text-primary mb-6"
                            variants={fadeUp}
                        >
                            Tech Stack
                        </motion.h2>
                        <motion.div
                            className="flex flex-wrap gap-3"
                            variants={fadeUp}
                        >
                            {project.techStack.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-4 py-2 rounded-lg text-sm font-mono border border-white/10 bg-white/[0.03] text-foreground/80 hover:border-primary/30 hover:bg-primary/5 transition-colors duration-200"
                                >
                                    {tech}
                                </span>
                            ))}
                        </motion.div>
                    </motion.section>
                )}

                {/* Phone Mockup */}
                {project.phoneMockup && (
                    <motion.section
                        className="flex justify-center"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        <div className="relative">
                            {/* Glow effect */}
                            <div className="absolute -inset-8 rounded-[3rem] bg-primary/10 blur-3xl opacity-40" />

                            {/* Phone frame */}
                            <div className="relative w-[280px] md:w-[320px] rounded-[2.5rem] border-[6px] border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/40 overflow-hidden">
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-zinc-900 rounded-b-2xl z-10" />

                                <img
                                    src={project.phoneMockup}
                                    alt={`${project.title} mobile`}
                                    className="w-full aspect-[9/16] object-cover"
                                />
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Thumbnail showcase (only if no OG image was used as hero, to avoid duplication) */}
                {project.ogImage && (
                    <motion.section
                        variants={stagger}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-80px" }}
                    >
                        <motion.h2
                            className="text-xs font-mono uppercase tracking-widest text-primary mb-6"
                            variants={fadeUp}
                        >
                            Preview
                        </motion.h2>
                        <motion.div
                            className="rounded-2xl overflow-hidden border border-white/10"
                            variants={fadeIn}
                        >
                            <img
                                src={project.thumbnail}
                                alt={`${project.title} thumbnail`}
                                className="w-full aspect-video object-cover"
                            />
                        </motion.div>
                    </motion.section>
                )}

                {/* CTA */}
                <motion.section
                    className="text-center py-12"
                    variants={stagger}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                >
                    <motion.p
                        className="text-muted-foreground mb-6"
                        variants={fadeUp}
                    >
                        Interested in this project?
                    </motion.p>
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        variants={fadeUp}
                    >
                        <Button size="lg" className="gap-2 group h-12 px-8" asChild>
                            <a href={project.link} target="_blank" rel="noopener noreferrer">
                                Visit {project.title}
                                <ExternalLink className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </a>
                        </Button>
                        <Button variant="outline" size="lg" className="gap-2 h-12 px-8" asChild>
                            <Link href="/work">
                                <ArrowLeft className="size-4" /> More Projects
                            </Link>
                        </Button>
                    </motion.div>
                </motion.section>
            </div>
        </div>
    )
}
