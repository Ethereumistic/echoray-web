"use client"

import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, ExternalLink, Calendar, CheckCircle2, Loader2, Smartphone, Monitor, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { PhoneMock } from "@/components/sections/phone-mock"
import { format } from "date-fns"

const stagger = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
}

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1, y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    },
}

const fadeIn = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1, scale: 1,
        transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    },
}

const slideIn = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1, x: 0,
        transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
    },
}

export default function WorkDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const router = useRouter()
    const project = useQuery(api.work.getProjectBySlug, { slug })

    if (project === undefined) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="size-8 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm font-medium">Loading project...</p>
                </div>
            </div>
        )
    }

    if (project === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 max-w-md px-6">
                    <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                        <span className="text-4xl">?</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Project not found</h1>
                        <p className="text-muted-foreground">This project doesn't exist or isn't published yet.</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push("/work")} className="gap-2">
                        <ArrowLeft className="size-4" /> Back to Work
                    </Button>
                </div>
            </div>
        )
    }

    const launchYear = project.launchDate ? format(new Date(project.launchDate), "yyyy") : null
    const completedYear = project.completedDate ? format(new Date(project.completedDate), "MMM yyyy") : null

    return (
        <div className="min-h-screen bg-background">
            <div className="min-h-screen lg:grid lg:grid-cols-2">
                <motion.div
                    className="sticky top-16 z-10 px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5 lg:hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-foreground"
                        asChild
                    >
                        <Link href="/work">
                            <ArrowLeft className="size-4" /> All Work
                        </Link>
                    </Button>
                </motion.div>

                <motion.div
                    className="relative px-6 py-4 lg:px-16 xl:px-24 flex flex-col justify-center"
                    variants={stagger}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        className="hidden lg:block mb-8"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 text-muted-foreground hover:text-foreground"
                            asChild
                        >
                            <Link href="/work">
                                <ArrowLeft className="size-4" /> All Work
                            </Link>
                        </Button>
                    </motion.div>

                    <div className="max-w-xl lg:ml-auto lg:text-right">
                        {project.projectType && (
                            <motion.div variants={fadeUp}>
                                <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 rounded-full mb-6">
                                    {project.projectType}
                                </span>
                            </motion.div>
                        )}

                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[0.95] mb-6"
                            variants={fadeUp}
                        >
                            {project.title}
                        </motion.h1>

                        {project.tagline && (
                            <motion.p
                                className="text-lg lg:text-xl text-muted-foreground leading-relaxed mb-8"
                                variants={fadeUp}
                            >
                                {project.tagline}
                            </motion.p>
                        )}

                        <motion.div
                            className="flex flex-wrap items-center gap-4 mb-10 lg:justify-end"
                            variants={fadeUp}
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-white/5">
                                <CheckCircle2 className={`size-3.5 ${project.status === "completed" ? "text-emerald-400" : "text-amber-400"}`} />
                                <span className={`text-xs font-semibold uppercase tracking-wider ${project.status === "completed" ? "text-emerald-400" : "text-amber-400"}`}>
                                    {project.status}
                                </span>
                            </div>

                            {(completedYear || launchYear) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="size-3.5" />
                                    <span className="text-xs font-mono">{completedYear || launchYear}</span>
                                </div>
                            )}
                        </motion.div>

                        {project.description && (
                            <motion.div
                                className="mb-10"
                                variants={fadeUp}
                            >
                                <div className="w-12 h-px bg-gradient-to-r from-primary to-transparent mb-6" />
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                    {project.description}
                                </p>
                            </motion.div>
                        )}

                        {project.techStack && project.techStack.length > 0 && (
                            <motion.div
                                className="mb-10"
                                variants={fadeUp}
                            >
                                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3 lg:text-right">
                                    Built with
                                </p>
                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                    {project.techStack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-muted/30 border border-white/5 text-foreground/70"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            className="flex flex-wrap gap-3 lg:justify-end"
                            variants={fadeUp}
                        >
                            <Button size="lg" className="gap-2 group h-12 px-6" asChild>
                                <a href={project.link} target="_blank" rel="noopener noreferrer">
                                    Visit Site
                                    <ExternalLink className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="lg" className="gap-2 h-12 px-6" asChild>
                                <Link href="/work">
                                    <ArrowLeft className="size-4" /> More Projects
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    className="relative min-h-[60vh] lg:min-h-screen flex items-center justify-center px-6 py-12 lg:py-20 bg-gradient-to-br from-muted/30 via-background to-background"
                    variants={slideIn}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-3xl" />
                    </div>

                    <Tabs defaultValue="mobile" className="relative z-10 flex flex-col items-center">
                        <TabsList className="mb-6 bg-muted/50 backdrop-blur-xl border border-white/10 p-1.5 h-auto gap-1">
                            <TabsTrigger
                                value="sq"
                                className="gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                            >
                                <Square className="size-3.5" />
                                <span className="hidden sm:inline">Square</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="16:9"
                                className="gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                            >
                                <Monitor className="size-3.5" />
                                <span className="hidden sm:inline">Desktop</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="mobile"
                                className="gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md transition-all"
                            >
                                <Smartphone className="size-3.5" />
                                <span className="hidden sm:inline">Mobile</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="w-[600px] h-[580px] relative">
                            <TabsContent value="sq" className="absolute inset-0 m-0 flex items-start justify-center focus-visible:outline-none data-[state=inactive]:hidden">
                                {project.thumbnail ? (
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-30" />
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
                                            <img
                                                src={project.thumbnail}
                                                alt={`${project.title} thumbnail`}
                                                className="w-[500px] h-[500px] object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-[500px] h-[500px] rounded-2xl bg-muted/30 border border-white/10 flex items-center justify-center">
                                        <Square className="size-12 text-muted-foreground/30" />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="16:9" className="absolute inset-0 m-0 flex items-start justify-center focus-visible:outline-none data-[state=inactive]:hidden">
                                {project.ogImage ? (
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl opacity-30" />
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/20">
                                            <img
                                                src={project.ogImage}
                                                alt={`${project.title} preview`}
                                                className="w-[600px] h-[315px] object-cover"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-[600px] h-[315px] rounded-2xl bg-muted/30 border border-white/10 flex items-center justify-center">
                                        <Monitor className="size-12 text-muted-foreground/30" />
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="mobile" className="absolute inset-0 m-0 flex items-start justify-center focus-visible:outline-none data-[state=inactive]:hidden">
                                {project.phoneMockup ? (
                                    <PhoneMock imageSrc={project.phoneMockup} alt={`${project.title} mobile preview`} />
                                ) : (
                                    <div className="w-[280px] h-[580px] bg-muted/30 border border-white/10 flex items-center justify-center rounded-[2.5rem]">
                                        <Smartphone className="size-12 text-muted-foreground/30" />
                                    </div>
                                )}
                            </TabsContent>
                        </div>
                    </Tabs>
                </motion.div>
            </div>
        </div>
    )
}
