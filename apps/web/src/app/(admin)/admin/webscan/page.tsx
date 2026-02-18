"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@convex/_generated/api"
import { cn } from "@echoray/ui/lib/utils"
import {
    Gauge,
    Search,
    TrendingUp,
    Accessibility,
    Zap,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
    Monitor,
    Smartphone,
    Trash2,
} from "lucide-react"
import {
    Badge
} from "@echoray/ui/components/ui/badge"
import { Skeleton } from "@echoray/ui/components/ui/skeleton"
import { Input } from "@echoray/ui/components/ui/input"
import { Label } from "@echoray/ui/components/ui/label"
import { Separator } from "@echoray/ui/components/ui/separator"
import { Button } from "@echoray/ui/components/ui/button"

type ScanStatus = "pending" | "completed" | "failed"
type Device = "mobile" | "desktop"

interface WebScanResult {
    _id: string
    scanId: string
    userId: string
    url: string
    status: ScanStatus
    scores?: {
        performance: number
        accessibility: number
        bestPractices: number
        seo: number
        pwa?: number
    }
    metrics?: {
        firstContentfulPaint: number
        largestContentfulPaint: number
        totalBlockingTime: number
        cumulativeLayoutShift: number
        speedIndex: number
    }
    aiReadiness?: {
        structuredData: boolean
        semanticHtml: boolean
        imageAltTags: number
        headingStructure: boolean
    }
    error?: string
    createdAt: number
    completedAt?: number
}

const STATUS_CONFIG: Record<ScanStatus, { label: string; icon: typeof Loader2; color: string }> = {
    pending: { label: "Scanning", icon: Loader2, color: "text-blue-400" },
    completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-400" },
    failed: { label: "Failed", icon: XCircle, color: "text-red-400" },
}

const CATEGORIES = [
    { value: "performance", label: "Performance" },
    { value: "accessibility", label: "Accessibility" },
    { value: "best-practices", label: "Best Practices" },
    { value: "seo", label: "SEO" },
] as const

function getScoreColor(score: number): string {
    if (score >= 90) return "text-emerald-400"
    if (score >= 50) return "text-amber-400"
    return "text-red-400"
}

function getScoreBg(score: number): string {
    if (score >= 90) return "bg-emerald-500/15 border-emerald-500/30"
    if (score >= 50) return "bg-amber-500/15 border-amber-500/30"
    return "bg-red-500/15 border-red-500/30"
}

function formatMs(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
}

export default function WebScanPage() {
    const stats = useQuery(api.webscan.getScanStats)
    const scans = useQuery(api.webscan.getRecentScans, { limit: 50 })
    const startScan = useAction(api.webscanActions.startWebScan)
    const deleteScan = useMutation(api.webscan.deleteScan)

    const [url, setUrl] = useState("")
    const [device, setDevice] = useState<Device>("mobile")
    const [selectedCategories, setSelectedCategories] = useState<string[]>(["performance", "seo"])
    const [isScanning, setIsScanning] = useState(false)
    const [activeScanId, setActiveScanId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [deletingScans, setDeletingScans] = useState<Set<string>>(new Set())

    const handleStartScan = async () => {
        if (!url.trim()) return

        let finalUrl = url.trim()
        if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
            finalUrl = "https://" + finalUrl
        }

        setIsScanning(true)
        setError(null)

        try {
            const result = await startScan({
                url: finalUrl,
                categories: selectedCategories as ("performance" | "accessibility" | "best-practices" | "seo" | "pwa")[],
                device,
            })
            setActiveScanId(result.scanId)
            setUrl("")
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to start scan")
        } finally {
            setIsScanning(false)
        }
    }

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat)
                ? prev.filter(c => c !== cat)
                : [...prev, cat]
        )
    }

    const handleDeleteScan = async (scanId: string) => {
        setDeletingScans(prev => new Set(prev).add(scanId))
        try {
            await deleteScan({ scanId })
        } catch (err) {
            console.error("Failed to delete scan:", err)
        } finally {
            setDeletingScans(prev => {
                const next = new Set(prev)
                next.delete(scanId)
                return next
            })
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tight flex items-center gap-3"
                    >
                        <Gauge className="size-8 text-blue-400" />
                        Web<span className="text-blue-500">Scan</span>
                    </motion.h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Lighthouse-powered website performance auditing
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Search}
                    label="Total Scans"
                    value={stats?.totalScans}
                    color="text-blue-400"
                    delay={0}
                />
                <StatCard
                    icon={Zap}
                    label="Avg Performance"
                    value={stats?.avgPerformance}
                    suffix="/100"
                    color="text-emerald-400"
                    delay={0.05}
                />
                <StatCard
                    icon={Accessibility}
                    label="Avg Accessibility"
                    value={stats?.avgAccessibility}
                    suffix="/100"
                    color="text-violet-400"
                    delay={0.1}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg SEO"
                    value={stats?.avgSeo}
                    suffix="/100"
                    color="text-orange-400"
                    delay={0.15}
                />
            </div>

            <div className="p-6 rounded-2xl bg-linear-to-br from-zinc-900 to-zinc-950 border border-zinc-800/60 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Search className="size-5 text-blue-400" />
                        New Scan
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2 lg:col-span-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            URL to scan
                        </Label>
                        <Input
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 focus:border-blue-500 focus:ring-blue-500/20"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Device
                        </Label>
                        <div className="flex gap-2 bg-zinc-950 rounded-lg border border-zinc-800 p-1">
                            <button
                                onClick={() => setDevice("mobile")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                    device === "mobile"
                                        ? "bg-blue-600 text-white"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <Smartphone className="size-4" />
                                Mobile
                            </button>
                            <button
                                onClick={() => setDevice("desktop")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                                    device === "desktop"
                                        ? "bg-blue-600 text-white"
                                        : "text-muted-foreground hover:text-white"
                                )}
                            >
                                <Monitor className="size-4" />
                                Desktop
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 lg:col-span-3">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Categories
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <Badge
                                    key={cat.value}
                                    variant={selectedCategories.includes(cat.value) ? "default" : "outline"}
                                    className={cn(
                                        "cursor-pointer transition-all",
                                        selectedCategories.includes(cat.value)
                                            ? "bg-blue-600 hover:bg-blue-500"
                                            : "hover:bg-zinc-800"
                                    )}
                                    onClick={() => toggleCategory(cat.value)}
                                >
                                    {cat.label}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={handleStartScan}
                        disabled={isScanning || !url.trim() || selectedCategories.length === 0}
                        className="bg-blue-600 hover:bg-blue-500"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Starting...
                            </>
                        ) : (
                            <>
                                <Gauge className="size-4 mr-2" />
                                Start Scan
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {activeScanId && (
                <ActiveScanProgress
                    scanId={activeScanId}
                    onDismiss={() => setActiveScanId(null)}
                />
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="size-5 text-muted-foreground" />
                        Scan History
                    </h2>
                </div>

                {!scans ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl bg-zinc-900" />
                        ))}
                    </div>
                ) : scans.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 text-center">
                        <Gauge className="size-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No scans yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                            Enter a URL above to start your first scan
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scans.map((scan: WebScanResult, i: number) => (
                            <ScanRow
                                key={scan._id}
                                scan={scan}
                                index={i}
                                onDelete={handleDeleteScan}
                                isDeleting={deletingScans.has(scan.scanId)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ icon: Icon, label, value, suffix, color, delay }: {
    icon: typeof Search
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

function ActiveScanProgress({ scanId, onDismiss }: {
    scanId: string
    onDismiss: () => void
}) {
    const scan = useQuery(api.webscan.getScanByScanId, { scanId })

    if (scan === null) {
        setTimeout(onDismiss, 0)
        return null
    }

    if (scan === undefined) {
        return (
            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-blue-400" />
                Starting scan...
            </div>
        )
    }

    const statusCfg = STATUS_CONFIG[scan.status as ScanStatus]
    const StatusIcon = statusCfg.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "p-5 rounded-2xl border backdrop-blur-sm",
                scan.status === "pending"
                    ? "bg-blue-500/5 border-blue-500/20"
                    : scan.status === "completed"
                        ? "bg-emerald-500/5 border-emerald-500/20"
                        : "bg-red-500/5 border-red-500/20"
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <StatusIcon className={cn("size-5", statusCfg.color, scan.status === "pending" && "animate-spin")} />
                    <span className={cn("font-bold text-sm", statusCfg.color)}>{statusCfg.label}</span>
                    <span className="text-muted-foreground text-xs">— {scan.url}</span>
                </div>
                {scan.status !== "pending" && (
                    <button onClick={onDismiss} className="text-muted-foreground hover:text-white transition-colors">
                        <X className="size-4" />
                    </button>
                )}
            </div>

            {scan.status === "pending" && (
                <div className="mt-3">
                    <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "60%" }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Scanning in progress (30-60 seconds)...
                    </p>
                </div>
            )}

            {scan.status === "completed" && scan.scores && (
                <div className="mt-3 flex gap-4">
                    <ScoreBadge label="Perf" score={Math.round(scan.scores.performance * 100)} />
                    <ScoreBadge label="A11y" score={Math.round(scan.scores.accessibility * 100)} />
                    <ScoreBadge label="BP" score={Math.round(scan.scores.bestPractices * 100)} />
                    <ScoreBadge label="SEO" score={Math.round(scan.scores.seo * 100)} />
                </div>
            )}

            {scan.status === "failed" && scan.error && (
                <p className="text-xs text-red-400 mt-2">{scan.error}</p>
            )}
        </motion.div>
    )
}

function ScoreBadge({ label, score }: { label: string; score: number }) {
    return (
        <div className={cn("px-2 py-1 rounded-lg border text-xs font-bold", getScoreBg(score), getScoreColor(score))}>
            {label}: {score}
        </div>
    )
}

function ScanRow({ scan, index, onDelete, isDeleting }: { scan: WebScanResult; index: number; onDelete: (scanId: string) => void; isDeleting: boolean }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const statusCfg = STATUS_CONFIG[scan.status as ScanStatus]
    const StatusIcon = statusCfg.icon

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: index * 0.03 }}
            className="rounded-2xl bg-zinc-900/40 border border-zinc-800/50 overflow-hidden"
        >
            <div className="flex items-center justify-between p-4 hover:bg-zinc-900/60 transition-colors">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-4 flex-1 text-left"
                >
                    <div className="flex items-center gap-1.5">
                        <StatusIcon className={cn("size-4", statusCfg.color, scan.status === "pending" && "animate-spin")} />
                    </div>
                    <div>
                        <span className="font-bold text-sm">{scan.url}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                                {new Date(scan.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </span>
                        </div>
                    </div>
                </button>

                <div className="flex items-center gap-3">
                    {scan.status === "completed" && scan.scores && (
                        <>
                            <ScoreMini score={Math.round(scan.scores.performance * 100)} />
                            <ScoreMini score={Math.round(scan.scores.accessibility * 100)} />
                            <ScoreMini score={Math.round(scan.scores.seo * 100)} />
                        </>
                    )}
                    <Badge variant="outline" className={cn("text-[10px] font-bold", statusCfg.color, "border-current/20")}>
                        {statusCfg.label}
                    </Badge>
                    <button
                        onClick={() => onDelete(scan.scanId)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        title="Delete scan"
                    >
                        {isDeleting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? (
                            <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && scan.status === "completed" && scan.scores && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Separator className="bg-zinc-800/50" />
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <ScoreCard label="Performance" score={Math.round(scan.scores.performance * 100)} />
                                <ScoreCard label="Accessibility" score={Math.round(scan.scores.accessibility * 100)} />
                                <ScoreCard label="Best Practices" score={Math.round(scan.scores.bestPractices * 100)} />
                                <ScoreCard label="SEO" score={Math.round(scan.scores.seo * 100)} />
                            </div>

                            {scan.metrics && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Core Web Vitals</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <MetricCard label="FCP" value={formatMs(scan.metrics.firstContentfulPaint)} />
                                        <MetricCard label="LCP" value={formatMs(scan.metrics.largestContentfulPaint)} />
                                        <MetricCard label="TBT" value={formatMs(scan.metrics.totalBlockingTime)} />
                                        <MetricCard label="CLS" value={scan.metrics.cumulativeLayoutShift.toFixed(3)} />
                                        <MetricCard label="Speed Index" value={formatMs(scan.metrics.speedIndex)} />
                                    </div>
                                </div>
                            )}

                            {scan.aiReadiness && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">AI Readiness</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <AiReadinessBadge label="Structured Data" value={scan.aiReadiness.structuredData} />
                                        <AiReadinessBadge label="Semantic HTML" value={scan.aiReadiness.semanticHtml} />
                                        <AiReadinessBadge label="Heading Structure" value={scan.aiReadiness.headingStructure} />
                                        <div className="p-2 rounded-lg bg-zinc-800/50 text-xs">
                                            <span className="text-muted-foreground">Alt Tags:</span>{" "}
                                            <span className="font-bold">{Math.round(scan.aiReadiness.imageAltTags * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <a
                                    href={scan.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                >
                                    Visit site <ExternalLink className="size-3" />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}

                {isExpanded && scan.status === "failed" && scan.error && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Separator className="bg-zinc-800/50" />
                        <div className="p-4">
                            <p className="text-sm text-red-400">{scan.error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function ScoreMini({ score }: { score: number }) {
    return (
        <span className={cn("text-xs font-bold tabular-nums", getScoreColor(score))}>
            {score}
        </span>
    )
}

function ScoreCard({ label, score }: { label: string; score: number }) {
    return (
        <div className={cn("p-3 rounded-xl border", getScoreBg(score))}>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-black mt-1", getScoreColor(score))}>{score}</p>
        </div>
    )
}

function MetricCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-2 rounded-lg bg-zinc-800/50">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-sm font-bold mt-0.5">{value}</p>
        </div>
    )
}

function AiReadinessBadge({ label, value }: { label: string; value: boolean }) {
    return (
        <div className={cn(
            "p-2 rounded-lg text-xs flex items-center gap-2",
            value ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
        )}>
            {value ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
            {label}
        </div>
    )
}
