"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../../convex/_generated/dataModel"
import { motion } from "framer-motion"
import { ArrowLeft, Save, ExternalLink, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

export default function WorkProjectEditorPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string
    const isNew = projectId === "new"

    const existingProject = useQuery(
        api.cms.getWorkProject,
        isNew ? "skip" : { id: projectId as Id<"workProjects"> }
    )
    const allProjects = useQuery(api.cms.listWorkProjects)
    const createProject = useMutation(api.cms.createWorkProject)
    const updateProject = useMutation(api.cms.updateWorkProject)

    const [title, setTitle] = useState("")
    const [slug, setSlug] = useState("")
    const [link, setLink] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [tagline, setTagline] = useState("")
    const [description, setDescription] = useState("")
    const [projectType, setProjectType] = useState("website")
    const [techStack, setTechStack] = useState("")
    const [status, setStatus] = useState<"completed" | "ongoing">("completed")
    const [isPublished, setIsPublished] = useState(true)
    const [order, setOrder] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

    // Populate form when editing
    useEffect(() => {
        if (existingProject) {
            setTitle(existingProject.title)
            setSlug(existingProject.slug)
            setLink(existingProject.link)
            setThumbnail(existingProject.thumbnail)
            setTagline(existingProject.tagline ?? "")
            setDescription(existingProject.description ?? "")
            setProjectType(existingProject.projectType ?? "website")
            setTechStack(existingProject.techStack?.join(", ") ?? "")
            setStatus(existingProject.status)
            setIsPublished(existingProject.isPublished)
            setOrder(existingProject.order)
            setSlugManuallyEdited(true) // don't override slug on edit
        }
    }, [existingProject])

    // Set default order for new projects
    useEffect(() => {
        if (isNew && allProjects) {
            setOrder(allProjects.length)
        }
    }, [isNew, allProjects])

    // Auto-generate slug from title
    useEffect(() => {
        if (!slugManuallyEdited) {
            setSlug(slugify(title))
        }
    }, [title, slugManuallyEdited])

    const handleSave = async () => {
        if (!title || !link || !thumbnail) return
        setIsSaving(true)
        try {
            const data = {
                title,
                slug,
                link,
                thumbnail,
                tagline: tagline || undefined,
                description: description || undefined,
                projectType: projectType || undefined,
                techStack: techStack ? techStack.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
                status: status as "completed" | "ongoing",
                isPublished,
                order,
            }

            if (isNew) {
                await createProject(data)
            } else {
                await updateProject({ id: projectId as Id<"workProjects">, ...data })
            }
            router.push("/admin/cms/work")
        } finally {
            setIsSaving(false)
        }
    }

    // Loading state for edit mode
    if (!isNew && existingProject === undefined) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="size-8 border-t-2 border-blue-500 rounded-full"
                />
                <p className="text-zinc-500 font-medium">Loading project...</p>
            </div>
        )
    }

    if (!isNew && existingProject === null) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
                <p className="text-white font-bold">Project not found</p>
                <Link href="/admin/cms/work" className="text-blue-400 hover:text-blue-300 text-sm">
                    ← Back to projects
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-10 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href="/admin/cms/work"
                            className="text-muted-foreground hover:text-white transition-colors"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tight"
                        >
                            {isNew ? "New" : "Edit"} <span className="text-blue-500">Project</span>
                        </motion.h1>
                    </div>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-8 shadow-xl shadow-blue-500/20"
                    onClick={handleSave}
                    disabled={isSaving || !title || !link || !thumbnail}
                >
                    <Save className="size-4" />
                    {isSaving ? "Saving..." : "Save Project"}
                </Button>
            </div>

            {/* Form */}
            <div className="space-y-8">
                {/* Core Fields */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-4xl bg-zinc-900 border border-white/5 space-y-6"
                >
                    <div className="mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Core Details</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. M-Texx Textile Recycling"
                            className="bg-zinc-800 border-white/10 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input
                            id="slug"
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.target.value)
                                setSlugManuallyEdited(true)
                            }}
                            placeholder="auto-generated-from-title"
                            className="bg-zinc-800 border-white/10 h-11 font-mono text-sm"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="link">Link *</Label>
                        <div className="relative">
                            <Input
                                id="link"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                placeholder="https://example.com"
                                className="bg-zinc-800 border-white/10 h-11 pr-10"
                            />
                            {link && (
                                <a
                                    href={link.startsWith("http") ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-400 transition-colors"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input
                            id="tagline"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            placeholder="Short one-liner about the project"
                            className="bg-zinc-800 border-white/10 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the project..."
                            className="bg-zinc-800 border-white/10 min-h-[100px]"
                        />
                    </div>
                </motion.div>

                {/* Thumbnail */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="p-8 rounded-4xl bg-zinc-900 border border-white/5 space-y-6"
                >
                    <div className="mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Thumbnail</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="thumbnail">Thumbnail URL *</Label>
                        <Input
                            id="thumbnail"
                            value={thumbnail}
                            onChange={(e) => setThumbnail(e.target.value)}
                            placeholder="https://cdn.jsdelivr.net/..."
                            className="bg-zinc-800 border-white/10 h-11 font-mono text-sm"
                        />
                    </div>

                    {thumbnail && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-800 max-w-xs">
                            <img
                                src={thumbnail}
                                alt="Thumbnail preview"
                                className="w-full aspect-square object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none"
                                }}
                            />
                        </div>
                    )}

                    {!thumbnail && (
                        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-800/50 max-w-xs aspect-square flex flex-col items-center justify-center gap-2">
                            <ImageIcon className="size-8 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Paste a thumbnail URL above</p>
                        </div>
                    )}
                </motion.div>

                {/* Metadata */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-4xl bg-zinc-900 border border-white/5 space-y-6"
                >
                    <div className="mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Metadata</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Project Type</Label>
                            <Select value={projectType} onValueChange={setProjectType}>
                                <SelectTrigger className="bg-zinc-800 border-white/10 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="web-app">Web App</SelectItem>
                                    <SelectItem value="e-commerce">E-Commerce</SelectItem>
                                    <SelectItem value="saas">SaaS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={status} onValueChange={(v) => setStatus(v as "completed" | "ongoing")}>
                                <SelectTrigger className="bg-zinc-800 border-white/10 h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="ongoing">Ongoing</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="techStack">Tech Stack</Label>
                        <Input
                            id="techStack"
                            value={techStack}
                            onChange={(e) => setTechStack(e.target.value)}
                            placeholder="Next.js, React, Tailwind, Convex (comma-separated)"
                            className="bg-zinc-800 border-white/10 h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="order">Display Order</Label>
                        <Input
                            id="order"
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                            className="bg-zinc-800 border-white/10 h-11 max-w-[120px]"
                        />
                    </div>
                </motion.div>

                {/* Publishing */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="p-8 rounded-4xl bg-zinc-900 border border-white/5 space-y-6"
                >
                    <div className="mb-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Publishing</p>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800 border border-white/10">
                        <div>
                            <p className="font-bold text-white">Published</p>
                            <p className="text-sm text-muted-foreground">
                                {isPublished
                                    ? "This project is visible on the public /work page"
                                    : "This project is hidden from the public site"
                                }
                            </p>
                        </div>
                        <Switch
                            checked={isPublished}
                            onCheckedChange={setIsPublished}
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
