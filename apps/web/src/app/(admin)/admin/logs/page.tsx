"use client"

import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Doc } from "../../../../../convex/_generated/dataModel"
import { motion } from "framer-motion"
import {
    History,
    User,
    Shield,
    Package,
    Clock,
    Activity,
    FileText,
    ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
// import { formatDistanceToNow } from "date-fns"

export default function AdminLogsPage() {
    const logs = useQuery(api.admin.listAuditLogs)

    const formatTime = (timestamp: number) => {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    const getActionIcon = (action: string) => {
        if (action.includes("role")) return <Shield className="size-4" />
        if (action.includes("permission")) return <FileText className="size-4" />
        if (action.includes("tier")) return <Package className="size-4" />
        if (action.includes("member")) return <User className="size-4" />
        return <Activity className="size-4" />
    }

    const getActionColor = (action: string) => {
        if (action.includes("created") || action.includes("granted") || action.includes("purchased") || action.includes("joined")) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
        if (action.includes("deleted") || action.includes("revoked") || action.includes("cancelled") || action.includes("removed")) return "text-red-400 bg-red-500/10 border-red-500/20"
        return "text-blue-400 bg-blue-500/10 border-blue-500/20"
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        System <span className="text-blue-500">Audit Logs</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Trace administrative actions and permission changes across the platform.</p>
                </div>
            </div>

            <div className="space-y-4">
                {logs ? (
                    logs.length > 0 ? (
                        <div className="rounded-[3rem] bg-zinc-900 border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-1 divide-y divide-white/5">
                                {logs.map((log: Doc<"permissionAuditLog">, i: number) => (
                                    <motion.div
                                        key={log._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        className="p-6 flex items-center justify-between group hover:bg-white/2 transition-colors"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                "size-10 rounded-xl flex items-center justify-center border transition-all",
                                                getActionColor(log.action)
                                            )}>
                                                {getActionIcon(log.action)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white uppercase tracking-tight">
                                                        {log.action.replace(/_/g, " ")}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600 font-mono">•</span>
                                                    <span className="text-[10px] text-zinc-500 font-medium italic flex items-center gap-1">
                                                        <Clock className="size-3" />
                                                        {formatTime(log._creationTime)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-zinc-400 font-medium">
                                                    Administrative action performed by <span className="text-blue-400">Staff</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                ID: {log._id.toString().slice(-6)}
                                            </div>
                                            <button className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                                <ArrowRight className="size-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-96 rounded-[3rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-500 gap-4">
                            <div className="size-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                                <History className="size-8 opacity-20" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-zinc-400 italic font-mono uppercase tracking-widest text-xs mb-2">Registry Silent</p>
                                <p className="max-w-xs text-xs leading-relaxed opacity-50">
                                    No administrative events have been recorded in the current epoch.
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
