"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../../../../../../../convex/_generated/api"
import type { Id } from "../../../../../../../convex/_generated/dataModel"
import { motion, AnimatePresence } from "framer-motion"
import {
    ArrowLeft, Save, ExternalLink, Image as ImageIcon, Upload, Link2,
    CheckCircle2, Loader2, Smartphone, Globe, Calendar as CalendarIcon, Lock, Eye,
    Server, User, FileText, StickyNote, Phone, Mail,
    Facebook, Instagram, Twitter, Linkedin, Youtube, Github,
    MessageCircle, Plus, Trash2, DollarSign, CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { fileToBase64, uploadToGitHub, deleteFromGitHub, createGitTag } from "@/lib/file-upload"
import { format } from "date-fns"

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
}

// ── Badge Components ─────────────────────────────────────────────

function PublicBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            <Eye className="size-2.5" />
            Public
        </span>
    )
}

function InternalBadge() {
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
            <Lock className="size-2.5" />
            Internal
        </span>
    )
}

// ── Date Picker (Popover + Calendar) ─────────────────────────────

function DatePicker({
    label,
    value,
    onChange,
}: {
    label: string
    value?: number
    onChange: (val: number | undefined) => void
}) {
    const [open, setOpen] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const selected = value ? new Date(value) : undefined

    // Sync input display with value
    useEffect(() => {
        setInputValue(selected ? format(selected, "dd/MM/yyyy") : "")
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setInputValue(raw)

        // Try parsing typed date (accept dd/mm/yyyy, dd-mm-yyyy, dd.mm.yyyy)
        const cleaned = raw.replace(/[.\-]/g, "/")
        const parts = cleaned.split("/")
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10)
            const month = parseInt(parts[1], 10) - 1
            const year = parseInt(parts[2], 10)
            const fullYear = year < 100 ? 2000 + year : year
            if (!isNaN(day) && !isNaN(month) && !isNaN(fullYear) && month >= 0 && month <= 11 && day >= 1 && day <= 31) {
                const date = new Date(fullYear, month, day)
                if (!isNaN(date.getTime())) {
                    onChange(date.getTime())
                }
            }
        }
    }

    const handleInputBlur = () => {
        // Reset display if invalid was typed
        setInputValue(selected ? format(selected, "dd/MM/yyyy") : "")
    }

    return (
        <div className="space-y-2">
            <Label className="text-sm">{label}</Label>
            <div className="flex gap-1.5">
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="dd/mm/yyyy"
                    className="bg-zinc-800 border-white/10 h-10 text-sm flex-1 font-mono"
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 shrink-0 bg-zinc-800 border-white/10 hover:bg-zinc-700"
                        >
                            <CalendarIcon className="size-4 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-zinc-900 border-white/10 min-h-[352px]" align="end">
                        <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            selected={selected}
                            defaultMonth={selected || new Date()}
                            fromYear={2020}
                            toYear={2035}
                            onSelect={(date) => {
                                onChange(date ? date.getTime() : undefined)
                                setOpen(false)
                            }}
                            className="rounded-md"
                        />
                        {selected && (
                            <div className="px-3 pb-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-muted-foreground hover:text-red-400"
                                    onClick={() => { onChange(undefined); setOpen(false) }}
                                >
                                    Clear date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}

// ── Social Media Config ──────────────────────────────────────────

const SOCIAL_PLATFORMS = [
    { value: "facebook", label: "Facebook", icon: Facebook },
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "twitter", label: "X (Twitter)", icon: Twitter },
    { value: "linkedin", label: "LinkedIn", icon: Linkedin },
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "github", label: "GitHub", icon: Github },
    { value: "tiktok", label: "TikTok", icon: Smartphone },
    { value: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { value: "telegram", label: "Telegram", icon: MessageCircle },
    { value: "website", label: "Website", icon: Globe },
] as const

type SocialEntry = { platform: string; url: string }

function SocialMediaEditor({
    socials,
    onChange,
}: {
    socials: SocialEntry[]
    onChange: (socials: SocialEntry[]) => void
}) {
    const addSocial = () => onChange([...socials, { platform: "instagram", url: "" }])
    const removeSocial = (index: number) => onChange(socials.filter((_, i) => i !== index))
    const updateSocial = (index: number, field: "platform" | "url", value: string) => {
        const updated = [...socials]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm">Social Media</Label>
                <Button variant="ghost" size="sm" onClick={addSocial} className="h-7 text-xs gap-1 text-blue-400 hover:text-blue-300">
                    <Plus className="size-3" /> Add
                </Button>
            </div>

            {socials.length === 0 && (
                <p className="text-xs text-muted-foreground/60 py-2">No social media links added</p>
            )}

            <AnimatePresence>
                {socials.map((social, index) => {
                    const platform = SOCIAL_PLATFORMS.find(p => p.value === social.platform)
                    const PlatformIcon = platform?.icon || Globe

                    return (
                        <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2">
                            <PlatformIcon className="size-4 text-muted-foreground shrink-0" />
                            <Select value={social.platform} onValueChange={(v) => updateSocial(index, "platform", v)}>
                                <SelectTrigger className="bg-zinc-800 border-white/10 h-8 w-[140px] text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SOCIAL_PLATFORMS.map((p) => (
                                        <SelectItem key={p.value} value={p.value}>
                                            <span className="flex items-center gap-2"><p.icon className="size-3.5" />{p.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input value={social.url} onChange={(e) => updateSocial(index, "url", e.target.value)}
                                placeholder={`https://${social.platform}.com/...`}
                                className="bg-zinc-800 border-white/10 h-8 text-xs flex-1" />
                            <Button variant="ghost" size="icon" onClick={() => removeSocial(index)}
                                className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0">
                                <Trash2 className="size-3.5" />
                            </Button>
                        </motion.div>
                    )
                })}
            </AnimatePresence>
        </div>
    )
}

// ── Media Upload Zone ────────────────────────────────────────────

const ASPECT_CLASSES: Record<string, string> = {
    thumbnail: "aspect-square",
    "og-image": "aspect-video",        // 16:9
    "phone-mockup": "aspect-[9/16]",   // 9:16
}

function MediaUploadZone({
    slug, label, fieldName, value, onChange, aspectHint,
}: {
    slug: string; label: string; fieldName: string; value: string
    onChange: (url: string) => void; aspectHint: string
}) {
    const [mode, setMode] = useState<"upload" | "url">(
        value && !value.includes("echoray-io/work") ? "url" : "upload"
    )
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const prepareCmsUpload = useAction(api.cms.prepareCmsUpload)

    const aspectClass = ASPECT_CLASSES[fieldName] || "aspect-video"

    const handleUpload = useCallback(async (file: File) => {
        if (!slug) { toast.error("Enter a title first to generate a slug"); return }
        if (!file.type.startsWith("image/")) { toast.error("Only image files are supported"); return }
        if (file.size > 20 * 1024 * 1024) { toast.error("File size must be under 20MB"); return }
        setIsUploading(true); setUploadProgress(0); setUploadSuccess(false)
        try {
            const ext = file.name.split(".").pop() || "png"
            const fileName = `${fieldName}.${ext}`
            const uploadData = await prepareCmsUpload({ slug, fileName })
            setUploadProgress(10)
            const base64 = await fileToBase64(file, (p) => setUploadProgress(10 + Math.round(p * 30)))
            setUploadProgress(40)
            const uploadResult = await uploadToGitHub({
                owner: uploadData.owner, repo: uploadData.repo, branch: uploadData.branch,
                path: uploadData.filePath, content: base64,
                message: `CMS: Upload ${fieldName} for ${slug}`, token: uploadData.githubToken,
                onProgress: (p) => setUploadProgress(40 + Math.round(p * 40)),
            })
            setUploadProgress(85)

            // Create immutable Git tag on the exact upload commit → bypasses jsDelivr cache
            const tag = `v${Math.floor(Date.now() / 1000)}`
            await createGitTag({
                owner: uploadData.owner, repo: uploadData.repo,
                token: uploadData.githubToken, tagName: tag,
                commitSha: uploadResult.commit.sha,
            })
            setUploadProgress(100)

            // Build CDN URL with tag: @v{timestamp} instead of @main
            const taggedCdnUrl = `https://cdn.jsdelivr.net/gh/${uploadData.owner}/${uploadData.repo}@${tag}/${uploadData.filePath}`
            onChange(taggedCdnUrl)

            setUploadSuccess(true)
            toast.success(`${label} uploaded!`)
            setTimeout(() => setUploadSuccess(false), 3000)
        } catch (error) {
            console.error("Upload error:", error)
            toast.error(error instanceof Error ? error.message : "Upload failed")
        } finally { setIsUploading(false) }
    }, [slug, fieldName, label, prepareCmsUpload, onChange])

    const handleDelete = useCallback(async () => {
        if (!slug || !value) return
        setIsDeleting(true)
        try {
            // Extract file path from CDN URL or figure out the GitHub path
            // CDN URL pattern: https://cdn.jsdelivr.net/gh/echoray-io/work@main/{slug}/{fieldName}.{ext}
            const ext = value.split(".").pop()?.split("?")[0] || "png"
            const fileName = `${fieldName}.${ext}`
            const uploadData = await prepareCmsUpload({ slug, fileName })

            await deleteFromGitHub({
                owner: uploadData.owner,
                repo: uploadData.repo,
                branch: uploadData.branch,
                path: uploadData.filePath,
                token: uploadData.githubToken,
            })

            onChange("")
            toast.success(`${label} deleted from repository`)
        } catch (error) {
            console.error("Delete error:", error)
            toast.error(error instanceof Error ? error.message : "Delete failed")
        } finally { setIsDeleting(false) }
    }, [slug, value, fieldName, label, prepareCmsUpload, onChange])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleUpload(file)
    }, [handleUpload])

    const hasImage = !!value && mode === "upload"

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">{label}</Label>
                <Tabs value={mode} onValueChange={(v) => setMode(v as "upload" | "url")}>
                    <TabsList className="bg-zinc-800 h-7">
                        <TabsTrigger value="upload" className="text-[10px] gap-1 h-5 px-2 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                            <Upload className="size-2.5" /> Upload
                        </TabsTrigger>
                        <TabsTrigger value="url" className="text-[10px] gap-1 h-5 px-2 data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                            <Link2 className="size-2.5" /> URL
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {mode === "upload" ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => !isUploading && !isDeleting && fileInputRef.current?.click()}
                    className={`relative rounded-xl border-2 border-dashed overflow-hidden cursor-pointer transition-all duration-200 ${aspectClass}
                        ${isDragOver ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                            : isUploading ? "border-blue-500/30 bg-blue-500/5 cursor-wait"
                                : uploadSuccess ? "border-emerald-500/50 bg-emerald-500/5"
                                    : hasImage ? "border-transparent"
                                        : "border-white/10 bg-zinc-800/50 hover:border-white/20 hover:bg-zinc-800"}`}
                >
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0]; if (file) handleUpload(file); e.target.value = ""
                    }} className="hidden" />

                    {/* Image Preview */}
                    {hasImage && !isUploading ? (
                        <div className="group absolute inset-0">
                            <img src={value} alt={label}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                            {/* Hover Overlay with Delete */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-xs text-white/70">Click to replace</p>
                            </div>
                            <button
                                className={`absolute top-2 right-2 size-8 rounded-lg flex items-center justify-center transition-all z-10
                                    ${isDeleting
                                        ? "bg-red-500/80 cursor-wait"
                                        : "bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 hover:scale-110"
                                    }`}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete()
                                }}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="size-4 text-white animate-spin" />
                                ) : (
                                    <Trash2 className="size-4 text-white" />
                                )}
                            </button>
                        </div>
                    ) : isUploading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="size-6 text-blue-400 animate-spin" />
                            <p className="text-xs text-blue-400">Uploading... {uploadProgress}%</p>
                            <div className="w-full max-w-[200px] h-1 rounded-full bg-zinc-700 overflow-hidden">
                                <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    ) : uploadSuccess ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <CheckCircle2 className="size-6 text-emerald-400" />
                            <p className="text-xs text-emerald-400">Done!</p>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <Upload className="size-6 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">Drop or click • {aspectHint}</p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <Input value={value} onChange={(e) => onChange(e.target.value)}
                        placeholder="https://cdn.jsdelivr.net/..." className="bg-zinc-800 border-white/10 h-9 font-mono text-xs" />
                    {value && (
                        <div className={`rounded-xl overflow-hidden border border-white/10 bg-zinc-800 ${aspectClass} max-w-[200px]`}>
                            <img src={value} alt={label} className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

// ── Dates Overview (Calendar-style visual) ───────────────────────

const DATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    "Contract Start": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
    "Contract End": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
    "Project Start": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    "Deadline": { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    "Completed": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    "Launch": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
    "Domain Expiry": { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
    "VPS Expiry": { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
}

function DatesOverview({ dates }: {
    dates: { label: string; value?: number }[]
}) {
    const filledDates = dates
        .filter(d => d.value)
        .sort((a, b) => a.value! - b.value!)

    // Collect all dates to highlight on the calendar
    const highlightedDates = useMemo(() =>
        filledDates.map(d => new Date(d.value!)),
        [filledDates]
    )

    const today = new Date()

    if (filledDates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground/50">
                <CalendarDays className="size-12" />
                <p className="text-sm font-medium">No dates set yet</p>
                <p className="text-xs">Add dates in the Internal tab to see them here</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-[1fr_auto] gap-8">
            {/* Timeline View */}
            <div className="space-y-3">
                {filledDates.map((d) => {
                    const date = new Date(d.value!)
                    const colors = DATE_COLORS[d.label] || { bg: "bg-zinc-800", text: "text-zinc-400", border: "border-zinc-700" }
                    const isPast = date < today
                    const isToday = date.toDateString() === today.toDateString()
                    const daysAway = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                    return (
                        <motion.div
                            key={d.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex items-center gap-4 p-4 rounded-2xl border ${colors.border} ${colors.bg}`}
                        >
                            {/* Date block */}
                            <div className="flex flex-col items-center justify-center w-16 shrink-0">
                                <span className={`text-2xl font-black ${colors.text}`}>
                                    {date.getDate()}
                                </span>
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">
                                    {format(date, "MMM yyyy")}
                                </span>
                            </div>

                            {/* Label + info */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold ${colors.text}`}>{d.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {format(date, "EEEE, MMMM d, yyyy")}
                                </p>
                            </div>

                            {/* Relative time badge */}
                            <div className="shrink-0">
                                {isToday ? (
                                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase">
                                        Today
                                    </span>
                                ) : isPast ? (
                                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase">
                                        {Math.abs(daysAway)}d ago
                                    </span>
                                ) : (
                                    <span className={`px-3 py-1 rounded-full ${daysAway <= 7 ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-400"} text-[10px] font-bold uppercase`}>
                                        In {daysAway}d
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Calendar with highlighted dates */}
            <div className="shrink-0">
                <div className="rounded-2xl border border-white/5 bg-zinc-900 p-2 sticky top-8">
                    <Calendar
                        mode="multiple"
                        selected={highlightedDates}
                        className="rounded-xl"
                        numberOfMonths={2}
                        defaultMonth={highlightedDates[0] || today}
                    />
                    {/* Legend */}
                    <div className="px-3 pb-3 pt-1 flex flex-wrap gap-2">
                        {filledDates.map(d => {
                            const colors = DATE_COLORS[d.label] || { text: "text-zinc-400" }
                            return (
                                <span key={d.label} className={`text-[9px] font-bold uppercase ${colors.text}`}>
                                    • {d.label}
                                </span>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ── Editor Tabs ──────────────────────────────────────────────────

type EditorTab = "all" | "public" | "internal" | "media" | "dates"

const TABS: { value: EditorTab; label: string; icon: React.ReactNode }[] = [
    { value: "all", label: "All", icon: <FileText className="size-3.5" /> },
    { value: "public", label: "Public", icon: <Eye className="size-3.5" /> },
    { value: "internal", label: "Internal", icon: <Lock className="size-3.5" /> },
    { value: "media", label: "Media", icon: <ImageIcon className="size-3.5" /> },
    { value: "dates", label: "Dates", icon: <CalendarIcon className="size-3.5" /> },
]

// ── Main Editor Page ─────────────────────────────────────────────

export default function WorkProjectEditorPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.projectId as string
    const isNew = projectId === "new"
    const [activeTab, setActiveTab] = useState<EditorTab>("all")

    const existingProject = useQuery(
        api.cms.getWorkProject,
        isNew ? "skip" : { id: projectId as Id<"workProjects"> }
    )
    const allProjects = useQuery(api.cms.listWorkProjects)
    const createProject = useMutation(api.cms.createWorkProject)
    const updateProject = useMutation(api.cms.updateWorkProject)

    // ── Form State: Public ──
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

    // ── Form State: Media ──
    const [ogImage, setOgImage] = useState("")
    const [phoneMockup, setPhoneMockup] = useState("")

    // ── Form State: Client ──
    const [clientName, setClientName] = useState("")
    const [clientPhone, setClientPhone] = useState("")
    const [clientEmail, setClientEmail] = useState("")
    const [clientSocials, setClientSocials] = useState<SocialEntry[]>([])

    // ── Form State: Infrastructure ──
    const [domain, setDomain] = useState("")
    const [domainProvider, setDomainProvider] = useState("")
    const [domainPrice, setDomainPrice] = useState("")
    const [dnsProvider, setDnsProvider] = useState("")
    const [dnsSameAsDomain, setDnsSameAsDomain] = useState(false)
    const [domainExpiryDate, setDomainExpiryDate] = useState<number | undefined>()
    const [vpsProvider, setVpsProvider] = useState("")
    const [vpsPrice, setVpsPrice] = useState("")
    const [vpsExpiryDate, setVpsExpiryDate] = useState<number | undefined>()
    const [githubRepoUrl, setGithubRepoUrl] = useState("")
    const [subscriptionTier, setSubscriptionTier] = useState("")
    const [internalNotes, setInternalNotes] = useState("")

    // ── Form State: Contract & Timeline ──
    const [contractStartDate, setContractStartDate] = useState<number | undefined>()
    const [contractEndDate, setContractEndDate] = useState<number | undefined>()
    const [startDate, setStartDate] = useState<number | undefined>()
    const [deadline, setDeadline] = useState<number | undefined>()
    const [completedDate, setCompletedDate] = useState<number | undefined>()
    const [launchDate, setLaunchDate] = useState<number | undefined>()

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
            setSlugManuallyEdited(true)
            setOgImage(existingProject.ogImage ?? "")
            setPhoneMockup(existingProject.phoneMockup ?? "")
            setClientName(existingProject.clientName ?? "")
            setClientPhone(existingProject.clientPhone ?? "")
            setClientEmail(existingProject.clientEmail ?? "")
            setClientSocials(existingProject.clientSocials ?? [])
            setDomain(existingProject.domain ?? "")
            setDomainProvider(existingProject.domainProvider ?? "")
            setDomainPrice(existingProject.domainPrice?.toString() ?? "")
            setDnsProvider(existingProject.dnsProvider ?? "")
            setDnsSameAsDomain(existingProject.dnsSameAsDomain ?? false)
            setDomainExpiryDate(existingProject.domainExpiryDate)
            setVpsProvider(existingProject.vpsProvider ?? "")
            setVpsPrice(existingProject.vpsPrice?.toString() ?? "")
            setVpsExpiryDate(existingProject.vpsExpiryDate)
            setGithubRepoUrl(existingProject.githubRepoUrl ?? "")
            setSubscriptionTier(existingProject.subscriptionTier ?? "")
            setInternalNotes(existingProject.internalNotes ?? "")
            setContractStartDate(existingProject.contractStartDate)
            setContractEndDate(existingProject.contractEndDate)
            setStartDate(existingProject.startDate)
            setDeadline(existingProject.deadline)
            setCompletedDate(existingProject.completedDate)
            setLaunchDate(existingProject.launchDate)
        }
    }, [existingProject])

    useEffect(() => { if (isNew && allProjects) setOrder(allProjects.length) }, [isNew, allProjects])
    useEffect(() => { if (!slugManuallyEdited) setSlug(slugify(title)) }, [title, slugManuallyEdited])
    useEffect(() => { if (dnsSameAsDomain) setDnsProvider(domainProvider) }, [dnsSameAsDomain, domainProvider])

    const handleSave = async () => {
        if (!title || !link || !thumbnail) return
        setIsSaving(true)
        try {
            const dp = domainPrice ? parseFloat(domainPrice) : undefined
            const vp = vpsPrice ? parseFloat(vpsPrice) : undefined

            const data = {
                title, slug, link, thumbnail,
                tagline: tagline || undefined,
                description: description || undefined,
                projectType: projectType || undefined,
                techStack: techStack ? techStack.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
                status: status as "completed" | "ongoing",
                isPublished, order,
                ogImage: ogImage || undefined,
                phoneMockup: phoneMockup || undefined,
                clientName: clientName || undefined,
                clientPhone: clientPhone || undefined,
                clientEmail: clientEmail || undefined,
                clientSocials: clientSocials.length > 0 ? clientSocials.filter(s => s.url) : undefined,
                domain: domain || undefined,
                domainProvider: domainProvider || undefined,
                domainPrice: dp,
                dnsProvider: dnsSameAsDomain ? domainProvider || undefined : dnsProvider || undefined,
                dnsSameAsDomain,
                domainExpiryDate,
                vpsProvider: vpsProvider || undefined,
                vpsPrice: vp,
                vpsExpiryDate,
                githubRepoUrl: githubRepoUrl || undefined,
                subscriptionTier: subscriptionTier || undefined,
                internalNotes: internalNotes || undefined,
                contractStartDate, contractEndDate,
                startDate, deadline, completedDate, launchDate,
            }

            if (isNew) await createProject(data)
            else await updateProject({ id: projectId as Id<"workProjects">, ...data })
            toast.success("Project saved!")
            router.push("/admin/cms/work")
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed")
        } finally { setIsSaving(false) }
    }

    // All dates for the Dates tab
    const allDates = useMemo(() => [
        { label: "Contract Start", value: contractStartDate },
        { label: "Contract End", value: contractEndDate },
        { label: "Project Start", value: startDate },
        { label: "Deadline", value: deadline },
        { label: "Completed", value: completedDate },
        { label: "Launch", value: launchDate },
        { label: "Domain Expiry", value: domainExpiryDate },
        { label: "VPS Expiry", value: vpsExpiryDate },
    ], [contractStartDate, contractEndDate, startDate, deadline, completedDate, launchDate, domainExpiryDate, vpsExpiryDate])

    // ── Loading / Not Found ──
    if (!isNew && existingProject === undefined) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="size-8 border-t-2 border-blue-500 rounded-full" />
                <p className="text-zinc-500 font-medium">Loading project...</p>
            </div>
        )
    }
    if (!isNew && existingProject === null) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
                <p className="text-white font-bold">Project not found</p>
                <Link href="/admin/cms/work" className="text-blue-400 hover:text-blue-300 text-sm">← Back to projects</Link>
            </div>
        )
    }

    const show = (tabs: EditorTab[]) => tabs.includes(activeTab) || activeTab === "all"

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Link href="/admin/cms/work" className="text-muted-foreground hover:text-white transition-colors">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black tracking-tight">
                        {isNew ? "New" : "Edit"} <span className="text-blue-500">Project</span>
                    </motion.h1>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EditorTab)}>
                    <TabsList className="bg-zinc-900 border border-white/5 h-10 p-1">
                        {TABS.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value}
                                className="text-xs gap-1.5 px-4 h-8 font-bold uppercase tracking-wider data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400 data-[state=active]:shadow-none">
                                {tab.icon}{tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* ═══════ FORM ═══════ */}
            <div className="space-y-8">

                {/* ── PUBLIC: Core Details ── */}
                <AnimatePresence mode="popLayout">
                    {show(["public"]) && (
                        <motion.div key="core" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Core Details</p>
                                <PublicBadge />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. M-Texx Textile Recycling" className="bg-zinc-800 border-white/10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input id="slug" value={slug}
                                        onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
                                        placeholder="auto-generated" className="bg-zinc-800 border-white/10 h-10 font-mono text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="link">Link *</Label>
                                    <div className="relative">
                                        <Input id="link" value={link} onChange={(e) => setLink(e.target.value)}
                                            placeholder="https://example.com" className="bg-zinc-800 border-white/10 h-10 pr-10" />
                                        {link && (
                                            <a href={link.startsWith("http") ? link : `https://${link}`} target="_blank" rel="noopener noreferrer"
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-400 transition-colors">
                                                <ExternalLink className="size-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tagline">Tagline</Label>
                                    <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)}
                                        placeholder="Short one-liner" className="bg-zinc-800 border-white/10 h-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the project..." className="bg-zinc-800 border-white/10 min-h-[80px]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── PUBLIC: Metadata ── */}
                <AnimatePresence mode="popLayout">
                    {show(["public"]) && (
                        <motion.div key="metadata" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Metadata & Publishing</p>
                                <PublicBadge />
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label>Project Type</Label>
                                    <Select value={projectType} onValueChange={setProjectType}>
                                        <SelectTrigger className="bg-zinc-800 border-white/10 h-10"><SelectValue /></SelectTrigger>
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
                                        <SelectTrigger className="bg-zinc-800 border-white/10 h-10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="order">Display Order</Label>
                                    <Input id="order" type="number" value={order}
                                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                                        className="bg-zinc-800 border-white/10 h-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="techStack">Tech Stack</Label>
                                <Input id="techStack" value={techStack} onChange={(e) => setTechStack(e.target.value)}
                                    placeholder="Next.js, React, Tailwind, Convex (comma-separated)" className="bg-zinc-800 border-white/10 h-10" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-800 border border-white/10">
                                <div>
                                    <p className="font-bold text-white text-sm">Published</p>
                                    <p className="text-xs text-muted-foreground">{isPublished ? "Visible on /work" : "Hidden from public"}</p>
                                </div>
                                <Switch checked={isPublished} onCheckedChange={setIsPublished} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── MEDIA ── */}
                <AnimatePresence mode="popLayout">
                    {show(["media"]) && (
                        <motion.div key="media" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Media Assets</p>
                                <PublicBadge />
                            </div>
                            <div className="grid grid-cols-3 gap-8">
                                <MediaUploadZone slug={slug} label="Thumbnail" fieldName="thumbnail"
                                    value={thumbnail} onChange={setThumbnail} aspectHint="1:1 square" />
                                <MediaUploadZone slug={slug} label="OG Image" fieldName="og-image"
                                    value={ogImage} onChange={setOgImage} aspectHint="1200×630" />
                                <MediaUploadZone slug={slug} label="Phone Mockup" fieldName="phone-mockup"
                                    value={phoneMockup} onChange={setPhoneMockup} aspectHint="9:16 portrait" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── INTERNAL: Client ── */}
                <AnimatePresence mode="popLayout">
                    {show(["internal"]) && (
                        <motion.div key="client" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-3xl bg-zinc-900 border border-red-500/10 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Client Information</p>
                                <InternalBadge />
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5"><User className="size-3.5 text-muted-foreground" /> Client Name</Label>
                                    <Input value={clientName} onChange={(e) => setClientName(e.target.value)}
                                        placeholder="e.g. John Doe" className="bg-zinc-800 border-white/10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" /> Phone Number</Label>
                                    <Input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)}
                                        placeholder="+359 888 123 456" className="bg-zinc-800 border-white/10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5"><Mail className="size-3.5 text-muted-foreground" /> Email</Label>
                                    <Input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)}
                                        placeholder="client@example.com" className="bg-zinc-800 border-white/10 h-10" />
                                </div>
                            </div>
                            <SocialMediaEditor socials={clientSocials} onChange={setClientSocials} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── INTERNAL: Infrastructure ── */}
                <AnimatePresence mode="popLayout">
                    {show(["internal"]) && (
                        <motion.div key="infra" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-3xl bg-zinc-900 border border-red-500/10 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Infrastructure</p>
                                <InternalBadge />
                            </div>

                            {/* Contract */}
                            <div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Contract</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <DatePicker label="Contract Start Date" value={contractStartDate} onChange={setContractStartDate} />
                                    <DatePicker label="Contract End Date" value={contractEndDate} onChange={setContractEndDate} />
                                </div>
                            </div>

                            {/* Domain & DNS */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Domain & DNS</p>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5"><Globe className="size-3.5 text-muted-foreground" /> Domain Provider</Label>
                                        <Input value={domainProvider} onChange={(e) => setDomainProvider(e.target.value)}
                                            placeholder="e.g. Namecheap" className="bg-zinc-800 border-white/10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5"><DollarSign className="size-3.5 text-muted-foreground" /> Domain Price /yr</Label>
                                        <div className="relative">
                                            <Input value={domainPrice}
                                                onChange={(e) => setDomainPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                                                placeholder="Free" className="bg-zinc-800 border-white/10 h-10 pr-8" />
                                            {domainPrice && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>}
                                            {!domainPrice && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold">FREE</span>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-1.5"><Globe className="size-3.5 text-muted-foreground" /> DNS Provider</Label>
                                            <label className="flex items-center gap-1.5 cursor-pointer">
                                                <Checkbox checked={dnsSameAsDomain} onCheckedChange={(v) => setDnsSameAsDomain(v === true)} className="size-3.5" />
                                                <span className="text-[10px] text-muted-foreground">Same as domain</span>
                                            </label>
                                        </div>
                                        <Input value={dnsSameAsDomain ? domainProvider : dnsProvider}
                                            onChange={(e) => setDnsProvider(e.target.value)}
                                            placeholder="e.g. Cloudflare" disabled={dnsSameAsDomain}
                                            className="bg-zinc-800 border-white/10 h-10 disabled:opacity-50" />
                                    </div>
                                    <DatePicker label="Domain Expiry" value={domainExpiryDate} onChange={setDomainExpiryDate} />
                                </div>
                            </div>

                            {/* VPS */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Hosting / VPS</p>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5"><Server className="size-3.5 text-muted-foreground" /> VPS Provider</Label>
                                        <Input value={vpsProvider} onChange={(e) => setVpsProvider(e.target.value)}
                                            placeholder="e.g. Vercel, Hetzner" className="bg-zinc-800 border-white/10 h-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5"><DollarSign className="size-3.5 text-muted-foreground" /> VPS Price /yr</Label>
                                        <div className="relative">
                                            <Input value={vpsPrice}
                                                onChange={(e) => setVpsPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                                                placeholder="Free" className="bg-zinc-800 border-white/10 h-10 pr-8" />
                                            {vpsPrice && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>}
                                            {!vpsPrice && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-400 font-bold">FREE</span>}
                                        </div>
                                    </div>
                                    <DatePicker label="VPS Expiry" value={vpsExpiryDate} onChange={setVpsExpiryDate} />
                                </div>
                            </div>

                            {/* Project Timeline */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Project Timeline</p>
                                <div className="grid grid-cols-4 gap-6">
                                    <DatePicker label="Start Date" value={startDate} onChange={setStartDate} />
                                    <DatePicker label="Deadline" value={deadline} onChange={setDeadline} />
                                    <DatePicker label="Completed" value={completedDate} onChange={setCompletedDate} />
                                    <DatePicker label="Launch Date" value={launchDate} onChange={setLaunchDate} />
                                </div>
                            </div>

                            {/* Other */}
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Other</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5"><Github className="size-3.5 text-muted-foreground" /> GitHub Repo URL</Label>
                                        <Input value={githubRepoUrl} onChange={(e) => setGithubRepoUrl(e.target.value)}
                                            placeholder="https://github.com/..." className="bg-zinc-800 border-white/10 h-10 font-mono text-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subscription Tier</Label>
                                        <Input value={subscriptionTier} onChange={(e) => setSubscriptionTier(e.target.value)}
                                            placeholder="e.g. Pro, Enterprise" className="bg-zinc-800 border-white/10 h-10" />
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <Label className="flex items-center gap-1.5"><StickyNote className="size-3.5 text-muted-foreground" /> Internal Notes</Label>
                                    <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)}
                                        placeholder="Private notes, credentials, API keys, etc..."
                                        className="bg-zinc-800 border-white/10 min-h-[100px]" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── DATES: Visual Calendar Overview ── */}
                <AnimatePresence mode="popLayout">
                    {activeTab === "dates" && (
                        <motion.div key="dates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="p-8 rounded-3xl bg-zinc-900 border border-white/5 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Dates Overview</p>
                                <InternalBadge />
                            </div>
                            <DatesOverview dates={allDates} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ═══════ STICKY SAVE BUTTON ═══════ */}
            <div className="fixed bottom-0 right-0 z-50 p-6 pointer-events-none">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }} className="pointer-events-auto">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-10 rounded-2xl shadow-2xl shadow-blue-500/30 text-base"
                        onClick={handleSave}
                        disabled={isSaving || !title || !link || !thumbnail}
                    >
                        {isSaving ? (<><Loader2 className="size-5 animate-spin" /> Saving...</>)
                            : (<><Save className="size-5" /> Save Project</>)}
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
