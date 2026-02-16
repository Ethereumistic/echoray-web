"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useAction } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Id } from "../../../../../convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"
import {
    Sparkles,
    Search,
    TrendingUp,
    Users,
    Flame,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Mail,
    Phone,
    MapPin,
    Globe,
    Building2,
    Star,
    Clock,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
    Copy,
    StickyNote,
    Filter,
    X,
    RotateCcw,
    Bug,
    Trash2,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// ── Types ────────────────────────────────────────────────────────

type PriorityTier = "hot" | "warm" | "cold" | "low"
type LeadStatus = "new" | "rating_queued" | "rated" | "offer_created" | "contacted" | "converted" | "rejected"
type SearchStatus = "in_progress" | "completed" | "failed"

interface LeadAISearch {
    _id: Id<"leadai_searches">
    industry: string
    niche?: string
    country: string
    city?: string
    websiteType: string
    requestedLeadCount: number
    status: SearchStatus
    startedAt: number
    completedAt?: number
    totalLeadsFound: number
    aiModel?: string
    errorLog?: string[]
}

interface LeadEmail { email: string; type: string; verified?: boolean }
interface LeadPhone { number: string; type: string; verified?: boolean }
interface LeadAddress { street: string; city: string; postalCode?: string; country: string; type?: string }
interface LeadContactPerson { name: string; position?: string }
interface LeadSocialMedia { url: string; platform: string; followers?: number }

interface LeadAILead {
    _id: Id<"leadai_leads">
    companyName: string
    companyNameLocal?: string
    industry: string
    businessDescription?: string
    emails?: LeadEmail[]
    phones?: LeadPhone[]
    addresses?: LeadAddress[]
    contactPersons?: LeadContactPerson[]
    website?: string
    socialMedia?: LeadSocialMedia[]
    viabilityScore: number
    priorityTier: PriorityTier
    status: LeadStatus
    aiConfidence?: number
    googleBusinessUrl?: string
    registrationNumber?: string
}

interface FormData {
    industry: string
    niche: string
    websiteType: string
    country: string
    city: string
    requestedLeadCount: number
    model: string
}

interface ErrorState {
    message: string
    details: string[]
    params: FormData
}

const PRIORITY_CONFIG: Record<PriorityTier, { label: string; color: string; bg: string; glow: string }> = {
    hot: { label: "Hot", color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30", glow: "shadow-orange-500/20" },
    warm: { label: "Warm", color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", glow: "shadow-amber-500/20" },
    cold: { label: "Cold", color: "text-sky-400", bg: "bg-sky-500/15 border-sky-500/30", glow: "shadow-sky-500/20" },
    low: { label: "Low", color: "text-zinc-400", bg: "bg-zinc-500/15 border-zinc-500/30", glow: "shadow-zinc-500/20" },
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
    new: { label: "New", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    rating_queued: { label: "Rating Queued", color: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
    rated: { label: "Rated", color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30" },
    offer_created: { label: "Offer Created", color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    contacted: { label: "Contacted", color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    converted: { label: "Converted", color: "bg-green-500/15 text-green-400 border-green-500/30" },
    rejected: { label: "Rejected", color: "bg-red-500/15 text-red-400 border-red-500/30" },
}

const SEARCH_STATUS_CONFIG: Record<SearchStatus, { label: string; icon: LucideIcon; color: string }> = {
    in_progress: { label: "In Progress", icon: Loader2, color: "text-blue-400" },
    completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-400" },
    failed: { label: "Failed", icon: XCircle, color: "text-red-400" },
}

const WEBSITE_TYPES = [
    { value: "e-commerce", label: "E-Commerce" },
    { value: "corporate", label: "Corporate" },
    { value: "portfolio", label: "Portfolio" },
    { value: "blog", label: "Blog" },
    { value: "landing-page", label: "Landing Page" },
    { value: "saas", label: "SaaS" },
    { value: "restaurant", label: "Restaurant" },
    { value: "real-estate", label: "Real Estate" },
    { value: "any", label: "Any Type" },
]

const AI_MODELS = [
    { value: "arcee-ai/trinity-large-preview:free", label: "Arcee Trinity (default)", tag: "free" },
    { value: "stepfun/step-3.5-flash:free", label: "Step 3.5 Flash", tag: "free" },
    { value: "z-ai/glm-4.5-air:free", label: "GLM 4.5 Air", tag: "free" },
    { value: "upstage/solar-pro-3:free", label: "Solar Pro 3", tag: "free" },
    { value: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", label: "Dolphin Mistral 24B", tag: "free" },
    { value: "x-ai/grok-4.1-fast", label: "Grok 4.1", tag: "BYOK" },
]

// ── Main Page Component ──────────────────────────────────────────

export default function LeadAIPage() {
    const stats = useQuery(api.leadai.getSearchStats)
    const searches = useQuery(api.leadai.listSearches)
    const createSearch = useMutation(api.leadai.createSearch)
    const startSearch = useAction(api.leadaiActions.startLeadSearch)

    const deleteSearch = useMutation(api.leadai.deleteSearch)
    const [deletingSearchId, setDeletingSearchId] = useState<Id<"leadai_searches"> | null>(null)

    const [selectedSearchId, setSelectedSearchId] = useState<Id<"leadai_searches"> | null>(null)
    const [selectedLeadId, setSelectedLeadId] = useState<Id<"leadai_leads"> | null>(null)
    const [isSearchFormOpen, setIsSearchFormOpen] = useState(false)
    const [isSearching, setIsSearching] = useState(false)
    const [filterPriority, setFilterPriority] = useState<string>("all")
    const [lastError, setLastError] = useState<{ message: string; details: string[]; params: typeof formData } | null>(null)

    // Search form state
    const [formData, setFormData] = useState({
        industry: "",
        niche: "",
        websiteType: "any",
        country: "Bulgaria",
        city: "",
        requestedLeadCount: 10,
        model: "arcee-ai/trinity-large-preview:free",
    })

    // When re-searching, we append to an existing search instead of creating a new one
    const [appendToSearchId, setAppendToSearchId] = useState<Id<"leadai_searches"> | null>(null)
    const updateSearch = useMutation(api.leadai.updateSearch)

    const handleStartSearch = async (retryParams?: typeof formData) => {
        const params = retryParams || formData
        if (!params.industry.trim()) return
        setIsSearching(true)
        setLastError(null)

        try {
            let searchId: Id<"leadai_searches">

            if (appendToSearchId) {
                // Re-search: append to existing search
                searchId = appendToSearchId
                await updateSearch({
                    id: searchId,
                    status: "in_progress",
                    requestedLeadCount: params.requestedLeadCount,
                })
                setAppendToSearchId(null)
            } else {
                // New search
                searchId = await createSearch({
                    industry: params.industry,
                    niche: params.niche || undefined,
                    websiteType: params.websiteType,
                    country: params.country,
                    city: params.city || undefined,
                    requestedLeadCount: params.requestedLeadCount,
                    aiModel: params.model,
                })
            }

            setSelectedSearchId(searchId)
            setIsSearchFormOpen(false)

            // Fire the action (runs in background)
            const result = await startSearch({
                searchId,
                industry: params.industry,
                niche: params.niche || undefined,
                websiteType: params.websiteType,
                country: params.country,
                city: params.city || undefined,
                requestedLeadCount: params.requestedLeadCount,
                model: params.model,
            })

            // Check if the action reported errors
            if (result.errors && result.errors.length > 0 && result.leadsFound === 0) {
                setLastError({
                    message: `Search for "${params.industry}" failed`,
                    details: result.errors,
                    params: { ...params },
                })
                setSelectedSearchId(null)
            } else {
                // Success — clear form only on new searches
                if (!retryParams && !appendToSearchId) {
                    setFormData({
                        industry: "",
                        niche: "",
                        websiteType: "any",
                        country: "Bulgaria",
                        city: "",
                        requestedLeadCount: 10,
                        model: "arcee-ai/trinity-large-preview:free",
                    })
                }
            }
        } catch (err: unknown) {
            console.error("Failed to start search:", err)
            setLastError({
                message: "Failed to start search",
                details: [err instanceof Error ? err.message : "Unknown error"],
                params: { ...params },
            })
            setSelectedSearchId(null)
        } finally {
            setIsSearching(false)
        }
    }

    const handleRetry = () => {
        if (!lastError) return
        const retryParams = lastError.params
        setLastError(null)
        handleStartSearch(retryParams)
    }

    const handleDeleteSearch = async (searchId: Id<"leadai_searches">) => {
        setDeletingSearchId(searchId)
        try {
            await deleteSearch({ id: searchId })
        } catch (err) {
            console.error("Failed to delete search:", err)
        } finally {
            setDeletingSearchId(null)
        }
    }

    const handleResearch = (search: Record<string, unknown>) => {
        setFormData({
            industry: String(search.industry || ""),
            niche: String(search.niche || ""),
            websiteType: String(search.websiteType || "any"),
            country: String(search.country || "Bulgaria"),
            city: String(search.city || ""),
            requestedLeadCount: String(search.requestedLeadCount || 10),
            model: String(search.aiModel || "arcee-ai/trinity-large-preview:free"),
        })
        setAppendToSearchId(search._id as Id<"leadai_searches">)  // Mark as append mode
        setIsSearchFormOpen(true)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tight flex items-center gap-3"
                    >
                        <Sparkles className="size-8 text-blue-400" />
                        Lead <span className="text-blue-500">AI</span>
                    </motion.h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        AI-powered lead generation for Bulgarian businesses
                    </p>
                </div>
                <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsSearchFormOpen(!isSearchFormOpen)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-colors"
                >
                    <Search className="size-4" />
                    New Search
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Search}
                    label="Total Searches"
                    value={stats?.totalSearches}
                    color="text-blue-400"
                    delay={0}
                />
                <StatCard
                    icon={Users}
                    label="Total Leads"
                    value={stats?.totalLeads}
                    color="text-emerald-400"
                    delay={0.05}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg. Score"
                    value={stats?.avgScore}
                    suffix="/100"
                    color="text-violet-400"
                    delay={0.1}
                />
                <StatCard
                    icon={Flame}
                    label="Hot Leads"
                    value={stats?.hotLeads}
                    color="text-orange-400"
                    delay={0.15}
                />
            </div>

            {/* Search Form */}
            <AnimatePresence>
                {isSearchFormOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <SearchForm
                            formData={formData}
                            setFormData={setFormData}
                            onSubmit={() => handleStartSearch()}
                            isSearching={isSearching}
                            onClose={() => { setIsSearchFormOpen(false); setAppendToSearchId(null); }}
                            appendMode={!!appendToSearchId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error Banner */}
            <AnimatePresence>
                {lastError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                    >
                        <ErrorBanner
                            error={lastError}
                            onRetry={handleRetry}
                            onDismiss={() => setLastError(null)}
                            isRetrying={isSearching}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Search Progress */}
            {selectedSearchId && (
                <ActiveSearchProgress
                    searchId={selectedSearchId}
                    onDismiss={() => setSelectedSearchId(null)}
                />
            )}

            {/* Search History & Leads */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="size-5 text-muted-foreground" />
                        Search History
                    </h2>
                    <div className="flex items-center gap-2">
                        <Filter className="size-4 text-muted-foreground" />
                        <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="w-32 h-8 text-xs bg-zinc-900 border-zinc-800">
                                <SelectValue placeholder="Filter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tiers</SelectItem>
                                <SelectItem value="hot">🔥 Hot</SelectItem>
                                <SelectItem value="warm">🟡 Warm</SelectItem>
                                <SelectItem value="cold">🔵 Cold</SelectItem>
                                <SelectItem value="low">⚪ Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {!searches ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl bg-zinc-900" />
                        ))}
                    </div>
                ) : searches.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="space-y-3">
                        {searches.map((search: Record<string, unknown>, i: number) => (
                            <SearchRow
                                key={search._id}
                                search={search}
                                index={i}
                                filterPriority={filterPriority}
                                onSelectLead={setSelectedLeadId}
                                onDelete={() => handleDeleteSearch(search._id)}
                                onResearch={() => handleResearch(search)}
                                isDeleting={deletingSearchId === search._id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Lead Detail Dialog */}
            <LeadDetailDialog
                leadId={selectedLeadId}
                onClose={() => setSelectedLeadId(null)}
            />
        </div>
    )
}

// ── Stat Card ────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, suffix, color, delay }: {
    icon: LucideIcon
    label: string
    value?: number
    suffix?: string
    color: string
    delay: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/60 backdrop-blur-sm"
        >
            <div className="flex items-center justify-between mb-3">
                <Icon className={cn("size-5", color)} />
                <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                {label}
            </p>
            {value !== undefined ? (
                <p className="text-2xl font-black tabular-nums">
                    {value}{suffix && <span className="text-sm text-muted-foreground ml-0.5">{suffix}</span>}
                </p>
            ) : (
                <Skeleton className="h-8 w-16 bg-zinc-800" />
            )}
        </motion.div>
    )
}

// ── Search Form ──────────────────────────────────────────────────

function SearchForm({ formData, setFormData, onSubmit, isSearching, onClose, appendMode }: {
    formData: Record<string, string>
    setFormData: (data: Record<string, string>) => void
    onSubmit: () => void
    isSearching: boolean
    onClose: () => void
    appendMode?: boolean
}) {
    return (
        <div className="p-6 rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800/60 shadow-xl">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    {appendMode ? (
                        <>
                            <RotateCcw className="size-5 text-amber-400" />
                            Add More Leads
                        </>
                    ) : (
                        <>
                            <Search className="size-5 text-blue-400" />
                            New Lead Search
                        </>
                    )}
                </h3>
                <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
                    <X className="size-4" />
                </button>
            </div>

            {appendMode && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-400">
                    New leads will be added to the existing search. Adjust the count and model as needed.
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Industry *
                    </Label>
                    <Input
                        placeholder="e.g. Restaurants, Hotels, Auto Repair..."
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        disabled={appendMode}
                        className="bg-zinc-950 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Niche (optional)
                    </Label>
                    <Input
                        placeholder="e.g. Fine dining, Boutique..."
                        value={formData.niche}
                        onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                        disabled={appendMode}
                        className="bg-zinc-950 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Website Type
                    </Label>
                    <Select
                        value={formData.websiteType}
                        onValueChange={(v) => setFormData({ ...formData, websiteType: v })}
                        disabled={appendMode}
                    >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {WEBSITE_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Country
                    </Label>
                    <Input
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        disabled={appendMode}
                        className="bg-zinc-950 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        City (optional)
                    </Label>
                    <Input
                        placeholder="e.g. Sofia, Plovdiv, Varna..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={appendMode}
                        className="bg-zinc-950 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Lead Count: {formData.requestedLeadCount}
                    </Label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.requestedLeadCount}
                        onChange={(e) => setFormData({ ...formData, requestedLeadCount: parseInt(e.target.value) })}
                        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 mt-3"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600">
                        <span>1</span>
                        <span>10</span>
                    </div>
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        AI Model
                    </Label>
                    <Select
                        value={formData.model}
                        onValueChange={(v) => setFormData({ ...formData, model: v })}
                    >
                        <SelectTrigger className="bg-zinc-950 border-zinc-800">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AI_MODELS.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                    {m.label}
                                    <span className={cn(
                                        "text-[10px] ml-2",
                                        m.tag === "BYOK" ? "text-amber-400" : "text-zinc-500"
                                    )}>{m.tag}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end mt-6">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSubmit}
                    disabled={isSearching || !formData.industry.trim()}
                    className={cn(
                        "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all",
                        isSearching || !formData.industry.trim()
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none"
                            : appendMode
                                ? "bg-amber-600 text-white shadow-amber-500/25 hover:bg-amber-500"
                                : "bg-blue-600 text-white shadow-blue-500/25 hover:bg-blue-500"
                    )}
                >
                    {isSearching ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Searching...
                        </>
                    ) : appendMode ? (
                        <>
                            <RotateCcw className="size-4" />
                            Find More Leads
                        </>
                    ) : (
                        <>
                            <Sparkles className="size-4" />
                            Start AI Search
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    )
}

// ── Error Banner ─────────────────────────────────────────────────

function ErrorBanner({ error, onRetry, onDismiss, isRetrying }: {
    error: { message: string; details: string[]; params: Record<string, string> }
    onRetry: () => void
    onDismiss: () => void
    isRetrying: boolean
}) {
    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 backdrop-blur-sm">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <AlertCircle className="size-5 text-red-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-bold text-sm text-red-400">{error.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Search for <span className="font-medium text-white">&ldquo;{error.params.industry}&rdquo;</span>
                            {error.params.city && <> in <span className="font-medium text-white">{error.params.city}</span></>}
                            {" "}failed with {error.details.length} error(s)
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onRetry}
                        disabled={isRetrying}
                        className={cn(
                            "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors",
                            isRetrying
                                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-500"
                        )}
                    >
                        {isRetrying ? (
                            <><Loader2 className="size-3 animate-spin" /> Retrying...</>
                        ) : (
                            <><RotateCcw className="size-3" /> Retry</>
                        )}
                    </motion.button>
                    <button onClick={onDismiss} className="text-muted-foreground hover:text-white transition-colors p-1">
                        <X className="size-4" />
                    </button>
                </div>
            </div>

            {/* Expandable error details */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <Bug className="size-3" />
                {showDetails ? "Hide" : "Show"} debug details
                {showDetails ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </button>

            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800/50 font-mono text-[11px] text-red-300/80 space-y-1 max-h-40 overflow-y-auto">
                            {error.details.map((detail, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-600 select-none">{i + 1}.</span>
                                    <span className="break-all">{detail}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-1.5">
                            Check the Convex dashboard logs for full stack traces (filter by [LeadAI])
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ── Active Search Progress ───────────────────────────────────────

function ActiveSearchProgress({ searchId, onDismiss }: {
    searchId: Id<"leadai_searches">
    onDismiss: () => void
}) {
    const search = useQuery(api.leadai.getSearch, { id: searchId })

    // If the search record no longer exists (deleted due to zero-lead failure), dismiss
    if (search === null) {
        // Use timeout to avoid setState during render
        setTimeout(onDismiss, 0)
        return null
    }

    // Still loading
    if (search === undefined) {
        return (
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-blue-400" />
                Starting search...
            </div>
        )
    }

    const isActive = search.status === "in_progress"
    const progress = search.requestedLeadCount > 0
        ? Math.round((search.totalLeadsFound / search.requestedLeadCount) * 100)
        : 0
    const statusCfg = SEARCH_STATUS_CONFIG[search.status as SearchStatus]
    const StatusIcon = statusCfg.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "p-5 rounded-2xl border backdrop-blur-sm",
                isActive
                    ? "bg-blue-500/5 border-blue-500/20"
                    : search.status === "completed"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-red-500/5 border-red-500/20"
            )}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <StatusIcon className={cn("size-5", statusCfg.color, isActive && "animate-spin")} />
                    <span className={cn("font-bold text-sm", statusCfg.color)}>{statusCfg.label}</span>
                    <span className="text-muted-foreground text-xs">
                        — {search.industry}{search.city ? `, ${search.city}` : ""}, {search.country}
                    </span>
                </div>
                {!isActive && (
                    <button onClick={onDismiss} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="size-4" />
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                <motion.div
                    className={cn(
                        "h-full rounded-full",
                        isActive ? "bg-blue-500" : search.status === "completed" ? "bg-emerald-500" : "bg-red-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(progress, isActive ? 5 : progress)}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{search.totalLeadsFound} / {search.requestedLeadCount} leads found</span>
                <span>{progress}%</span>
            </div>

            {/* Show error log if failed with some leads */}
            {search.status === "failed" && search.errorLog && search.errorLog.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-zinc-950 border border-red-500/10 text-[11px] font-mono text-red-300/70 space-y-1 max-h-28 overflow-y-auto">
                    {search.errorLog.map((err: string, i: number) => (
                        <div key={i}>{err}</div>
                    ))}
                </div>
            )}
        </motion.div>
    )
}

// ── Search Row (expandable) ──────────────────────────────────────

function SearchRow({ search, index, filterPriority, onSelectLead, onDelete, onResearch, isDeleting }: {
    search: Record<string, unknown>
    index: number
    filterPriority: string
    onSelectLead: (id: Id<"leadai_leads">) => void
    onDelete: () => void
    onResearch: () => void
    isDeleting: boolean
}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const leads = useQuery(
        api.leadai.listLeadsBySearch,
        isExpanded ? { searchId: search._id } : "skip"
    )

    const statusCfg = SEARCH_STATUS_CONFIG[search.status as SearchStatus]
    const StatusIcon = statusCfg.icon

    const filteredLeads = leads?.filter((l: Record<string, unknown>) =>
        filterPriority === "all" || l.priorityTier === filterPriority
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-2xl bg-zinc-900/40 border border-zinc-800/50 overflow-hidden"
        >
            {/* Search header row */}
            <div className="flex items-center justify-between p-4 hover:bg-zinc-900/60 transition-colors">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-4 flex-1 text-left"
                >
                    <div className="flex items-center gap-1.5">
                        <StatusIcon className={cn("size-4", statusCfg.color, search.status === "in_progress" && "animate-spin")} />
                    </div>
                    <div>
                        <span className="font-bold text-sm">
                            {search.industry}
                            {search.niche && <span className="text-muted-foreground font-normal"> · {search.niche}</span>}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                                {search.city ? `${search.city}, ` : ""}{search.country}
                            </span>
                            <span className="text-[10px] text-zinc-600">·</span>
                            <span className="text-xs text-muted-foreground">
                                {new Date(search.startedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                            </span>
                        </div>
                    </div>
                </button>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[10px] font-bold", statusCfg.color, "border-current/20")}>
                        {statusCfg.label}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground tabular-nums">
                        {search.totalLeadsFound} leads
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 ml-2">
                        {/* Re-search button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onResearch(); }}
                            title="Re-search with these parameters"
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                            <RotateCcw className="size-3.5" />
                        </button>

                        {/* Delete button */}
                        {confirmDelete ? (
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(); setConfirmDelete(false); }}
                                    disabled={isDeleting}
                                    className="px-2 py-1 rounded-lg bg-red-500/15 text-red-400 text-[10px] font-bold hover:bg-red-500/25 transition-colors"
                                >
                                    {isDeleting ? <Loader2 className="size-3 animate-spin" /> : "Delete"}
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                                    className="px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-[10px] font-bold hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                                title="Delete this search"
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="size-3.5" />
                            </button>
                        )}
                    </div>

                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? (
                            <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded leads table */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Separator className="bg-zinc-800/50" />
                        {!leads ? (
                            <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                <Loader2 className="size-4 animate-spin" />
                                Loading leads...
                            </div>
                        ) : filteredLeads && filteredLeads.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-800/50 hover:bg-transparent">
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[250px]">Company</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[80px]">Score</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[80px]">Tier</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[80px]">Emails</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[80px]">Phones</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[100px]">Website</TableHead>
                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[100px]">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredLeads.map((lead: Record<string, unknown>) => (
                                            <LeadRow
                                                key={lead._id}
                                                lead={lead}
                                                onClick={() => onSelectLead(lead._id)}
                                            />
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-sm text-muted-foreground space-y-1">
                                {search.status === "failed" && search.errorLog?.length > 0 ? (
                                    <>
                                        <p className="text-red-400">Search failed: {search.errorLog[0]?.replace("Pipeline error: ", "")}</p>
                                        <p className="text-xs text-zinc-500">Try re-searching with a different model or broader criteria</p>
                                    </>
                                ) : search.status === "completed" && search.totalLeadsFound === 0 ? (
                                    <>
                                        <p>No businesses found for this search</p>
                                        <p className="text-xs text-zinc-500">Try a different city, broader industry, or use Grok 4.1 for better results</p>
                                    </>
                                ) : (
                                    filterPriority !== "all" ? "No leads matching filter" : "No leads found for this search"
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// ── Lead Table Row ───────────────────────────────────────────────

function LeadRow({ lead, onClick }: { lead: Record<string, unknown>; onClick: () => void }) {
    const priorityCfg = PRIORITY_CONFIG[lead.priorityTier as PriorityTier]
    const statusCfg = STATUS_CONFIG[lead.status as LeadStatus]

    const scoreColor =
        lead.viabilityScore >= 80 ? "text-orange-400" :
            lead.viabilityScore >= 60 ? "text-amber-400" :
                lead.viabilityScore >= 40 ? "text-sky-400" :
                    "text-zinc-400"

    return (
        <TableRow
            onClick={onClick}
            className="border-zinc-800/30 cursor-pointer hover:bg-zinc-800/30 transition-colors"
        >
            <TableCell className="font-medium text-sm max-w-[250px]">
                <div className="truncate">{lead.companyName}</div>
                {lead.companyNameLocal && (
                    <div className="text-[10px] text-muted-foreground truncate">{lead.companyNameLocal}</div>
                )}
            </TableCell>
            <TableCell>
                <span className={cn("font-black text-lg tabular-nums", scoreColor)}>
                    {lead.viabilityScore}
                </span>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={cn("text-[10px] font-bold border", priorityCfg.bg, priorityCfg.color)}>
                    {priorityCfg.label}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Mail className="size-3" />
                    <span className="text-xs">{lead.emails?.length || 0}</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Phone className="size-3" />
                    <span className="text-xs">{lead.phones?.length || 0}</span>
                </div>
            </TableCell>
            <TableCell>
                {lead.website ? (
                    <a
                        href={lead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
                    >
                        <Globe className="size-3" />
                        Visit
                        <ExternalLink className="size-2.5" />
                    </a>
                ) : (
                    <span className="text-xs text-orange-400/80 font-medium">No site ✨</span>
                )}
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={cn("text-[10px] font-bold border", statusCfg.color)}>
                    {statusCfg.label}
                </Badge>
            </TableCell>
        </TableRow>
    )
}

// ── Lead Detail Dialog ───────────────────────────────────────────

function LeadDetailDialog({ leadId, onClose }: {
    leadId: Id<"leadai_leads"> | null
    onClose: () => void
}) {
    const lead = useQuery(api.leadai.getLead, leadId ? { id: leadId } : "skip")
    const updateStatus = useMutation(api.leadai.updateLeadStatus)
    const updateNotes = useMutation(api.leadai.updateLeadNotes)
    const [notes, setNotes] = useState("")
    const [isSavingNotes, setIsSavingNotes] = useState(false)

    const isOpen = leadId !== null

    // Sync notes when lead changes
    if (lead && notes === "" && lead.notes) {
        setNotes(lead.notes)
    }

    if (!isOpen) return null

    const handleStatusChange = async (status: string) => {
        if (!leadId) return
        await updateStatus({ id: leadId, status: status as LeadStatus })
    }

    const handleSaveNotes = async () => {
        if (!leadId) return
        setIsSavingNotes(true)
        await updateNotes({ id: leadId, notes })
        setIsSavingNotes(false)
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { onClose(); setNotes("") }}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white">
                {!lead ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="size-6 animate-spin text-blue-400" />
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black flex items-center gap-2">
                                <Building2 className="size-5 text-blue-400" />
                                {lead.companyName}
                            </DialogTitle>
                            {lead.companyNameLocal && (
                                <p className="text-sm text-muted-foreground">{lead.companyNameLocal}</p>
                            )}
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                            {/* AI Source Warning */}
                            <div className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium",
                                (lead.aiConfidence ?? 0) >= 0.8
                                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                    : (lead.aiConfidence ?? 0) >= 0.5
                                        ? "bg-amber-500/5 border-amber-500/20 text-amber-400"
                                        : "bg-red-500/5 border-red-500/20 text-red-400"
                            )}>
                                <AlertCircle className="size-3.5 shrink-0" />
                                <span>
                                    AI Generated · {Math.round((lead.aiConfidence ?? 0) * 100)}% confidence — verify before contacting
                                </span>
                            </div>

                            {/* Score Breakdown */}
                            <ScoreBreakdown score={lead.viabilityScore} breakdown={lead.scoreBreakdown} tier={lead.priorityTier} />

                            {/* Status & Assignment */}
                            <div className="flex items-center gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</Label>
                                    <Select value={lead.status} onValueChange={handleStatusChange}>
                                        <SelectTrigger className="bg-zinc-900 border-zinc-800 h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
                                                <SelectItem key={value} value={value}>{cfg.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        AI Confidence
                                    </Label>
                                    <div className="h-9 flex items-center px-3 rounded-md bg-zinc-900 border border-zinc-800 text-sm">
                                        {Math.round(lead.aiConfidence * 100)}%
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-zinc-800/50" />

                            {/* Contact Info */}
                            <DetailSection title="Contact Information" icon={Mail}>
                                {lead.emails?.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Emails</p>
                                        {lead.emails.map((e: { email: string; type: string }, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm group">
                                                <Mail className="size-3 text-muted-foreground" />
                                                <span>{e.email}</span>
                                                <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-500">{e.type}</Badge>
                                                <button onClick={() => copyToClipboard(e.email)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Copy className="size-3 text-zinc-500 hover:text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {lead.phones?.length > 0 && (
                                    <div className="space-y-1.5 mt-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Phones</p>
                                        {lead.phones.map((p: { number: string; type: string }, i: number) => (
                                            <div key={i} className="flex items-center gap-2 text-sm group">
                                                <Phone className="size-3 text-muted-foreground" />
                                                <span>{p.number}</span>
                                                <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-500">{p.type}</Badge>
                                                <button onClick={() => copyToClipboard(p.number)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Copy className="size-3 text-zinc-500 hover:text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {lead.contactPersons?.length > 0 && (
                                    <div className="space-y-1.5 mt-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Contact Persons</p>
                                        {lead.contactPersons.map((c: { name: string; position?: string }, i: number) => (
                                            <div key={i} className="text-sm">
                                                <span className="font-medium">{c.name}</span>
                                                {c.position && <span className="text-muted-foreground"> — {c.position}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {lead.addresses?.length > 0 && (
                                    <div className="space-y-1.5 mt-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Addresses</p>
                                        {lead.addresses.map((a: { street: string; city: string; postalCode?: string; country: string }, i: number) => (
                                            <div key={i} className="flex items-start gap-2 text-sm">
                                                <MapPin className="size-3 text-muted-foreground mt-0.5" />
                                                <span>{a.street}, {a.city}{a.postalCode ? ` ${a.postalCode}` : ""}, {a.country}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </DetailSection>

                            <Separator className="bg-zinc-800/50" />

                            {/* Digital Presence */}
                            <DetailSection title="Digital Presence" icon={Globe}>
                                {lead.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="size-3 text-blue-400" />
                                        <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
                                            {lead.website}
                                        </a>
                                    </div>
                                )}
                                {lead.websiteStatus && (
                                    <div className="flex gap-3 mt-2">
                                        <Badge variant="outline" className={cn("text-[10px]", lead.websiteStatus.hasHttps ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30")}>
                                            {lead.websiteStatus.hasHttps ? "✓ HTTPS" : "✗ No HTTPS"}
                                        </Badge>
                                        <Badge variant="outline" className={cn("text-[10px]", lead.websiteStatus.isMobileResponsive ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30")}>
                                            {lead.websiteStatus.isMobileResponsive ? "✓ Mobile" : "✗ Not Mobile"}
                                        </Badge>
                                        {lead.websiteStatus.estimatedAge && (
                                            <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-700">
                                                ~{lead.websiteStatus.estimatedAge}y old
                                            </Badge>
                                        )}
                                    </div>
                                )}
                                {lead.socialMedia?.length > 0 && (
                                    <div className="space-y-1.5 mt-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Social Media</p>
                                        {lead.socialMedia.map((s: { url: string; platform: string; followers?: number }, i: number) => (
                                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300">
                                                <ExternalLink className="size-3" />
                                                {s.platform}
                                                {s.followers && <span className="text-muted-foreground">({s.followers} followers)</span>}
                                            </a>
                                        ))}
                                    </div>
                                )}
                                {lead.googleBusinessUrl && (
                                    <a href={lead.googleBusinessUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mt-2">
                                        <Star className="size-3" />
                                        Google Business Profile
                                    </a>
                                )}
                            </DetailSection>

                            {/* Registry Data */}
                            {(lead.registrationNumber || lead.registryData) && (
                                <>
                                    <Separator className="bg-zinc-800/50" />
                                    <DetailSection title="Registry Data" icon={Building2}>
                                        {lead.registrationNumber && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-zinc-500">EIK/BULSTAT:</span>
                                                <span className="font-mono">{lead.registrationNumber}</span>
                                                <button onClick={() => copyToClipboard(lead.registrationNumber!)} className="text-zinc-500 hover:text-white">
                                                    <Copy className="size-3" />
                                                </button>
                                            </div>
                                        )}
                                        {lead.registryData && (
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                {lead.registryData.employeeCount && (
                                                    <div><span className="text-zinc-500">Employees:</span> {lead.registryData.employeeCount}</div>
                                                )}
                                                {lead.registryData.estimatedRevenue && (
                                                    <div><span className="text-zinc-500">Revenue:</span> {lead.registryData.estimatedRevenue.toLocaleString()} BGN</div>
                                                )}
                                                {lead.registryData.legalStatus && (
                                                    <div><span className="text-zinc-500">Status:</span> {lead.registryData.legalStatus}</div>
                                                )}
                                                {lead.registryData.registrationDate && (
                                                    <div><span className="text-zinc-500">Registered:</span> {lead.registryData.registrationDate}</div>
                                                )}
                                            </div>
                                        )}
                                    </DetailSection>
                                </>
                            )}

                            <Separator className="bg-zinc-800/50" />

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                    <StickyNote className="size-3" />
                                    Notes
                                </Label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add internal notes..."
                                    rows={3}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none"
                                />
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes}
                                        className="text-xs font-bold text-blue-400 hover:text-blue-300 disabled:text-zinc-600 transition-colors"
                                    >
                                        {isSavingNotes ? "Saving..." : "Save Notes"}
                                    </button>
                                </div>
                            </div>

                            {/* Data Sources */}
                            <div className="flex flex-wrap gap-1.5">
                                {lead.dataSource?.map((src: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-[9px] bg-zinc-900/50 border-zinc-800 text-zinc-500">
                                        {src}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ── Score Breakdown ──────────────────────────────────────────────

function ScoreBreakdown({ score, breakdown, tier }: {
    score: number
    breakdown: { contactInfoScore: number; businessScaleScore: number; digitalPresenceScore: number; verificationScore: number }
    tier: string
}) {
    const priorityCfg = PRIORITY_CONFIG[tier as PriorityTier]
    const segments = [
        { label: "Contact", value: breakdown.contactInfoScore, max: 25, color: "bg-blue-500" },
        { label: "Business", value: breakdown.businessScaleScore, max: 30, color: "bg-violet-500" },
        { label: "Digital", value: breakdown.digitalPresenceScore, max: 25, color: "bg-emerald-500" },
        { label: "Verified", value: breakdown.verificationScore, max: 20, color: "bg-amber-500" },
    ]

    return (
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={cn("text-3xl font-black tabular-nums", priorityCfg.color)}>
                        {score}
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <Badge variant="outline" className={cn("font-bold border", priorityCfg.bg, priorityCfg.color)}>
                    {priorityCfg.label}
                </Badge>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {segments.map((seg) => (
                    <div key={seg.label} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{seg.label}</span>
                            <span className="text-[10px] font-mono text-zinc-400">{seg.value}/{seg.max}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full", seg.color)}
                                style={{ width: `${(seg.value / seg.max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ── Detail Section ───────────────────────────────────────────────

function DetailSection({ title, icon: Icon, children }: {
    title: string
    icon: LucideIcon
    children: React.ReactNode
}) {
    return (
        <div className="space-y-3">
            <h4 className="text-sm font-bold flex items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                {title}
            </h4>
            <div className="pl-6">
                {children}
            </div>
        </div>
    )
}

// ── Empty State ──────────────────────────────────────────────────

function EmptyState() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Sparkles className="size-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold mb-1">No searches yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                Start your first AI-powered lead search to find Bulgarian businesses that need web development services.
            </p>
        </motion.div>
    )
}
