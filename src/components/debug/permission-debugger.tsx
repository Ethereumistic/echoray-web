"use client"

import { useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ChevronUp, ChevronDown, CheckCircle2, Lock, Terminal, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export function PermissionDebugger() {
    const { profile, activeOrganization, permissions, isAuthenticated, isLoading } = useAuthStore()
    const [isExpanded, setIsExpanded] = useState(false)

    // Don't show anything during initial load if not authenticated
    if (isLoading && !isAuthenticated) return null
    if (!isAuthenticated) return null

    // Get tier from active organization if available, otherwise from profile
    const tier = activeOrganization?.subscriptionTier || profile?.subscriptionTier
    const tierName = tier?.name || "Free"

    // Only show the panel in development or if user is system admin
    const isDev = process.env.NODE_ENV === 'development'
    const isSystemAdmin = permissions['system.admin'] === true

    // For debugging, we'll keep it visible if isDev is true
    if (!isDev && !isSystemAdmin) return null

    return (
        <div className="fixed bottom-6 right-6 z-9999 flex flex-col items-end gap-3 pointer-events-none">
            {/* Tier Indicator (Always Visible) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                    "pointer-events-auto flex items-center gap-3 px-4 py-2.5 rounded-2xl cursor-pointer transition-all duration-500",
                    "bg-black/40 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 shadow-[0_8px_32px_rgba(0,0,0,0.5)] group",
                    isExpanded && "border-blue-500/50 bg-blue-500/10 scale-105"
                )}
            >
                <div className="relative">
                    <div className={cn(
                        "absolute -inset-1 rounded-full blur-sm opacity-0 group-hover:opacity-40 transition-opacity duration-500",
                        isExpanded ? "bg-blue-400 opacity-40" : "bg-blue-400"
                    )} />
                    <Shield className={cn(
                        "w-5 h-5 relative z-10 transition-all duration-500",
                        isExpanded ? "text-blue-400 rotate-12" : "text-gray-400 group-hover:text-blue-300"
                    )} />
                </div>

                <div className="flex flex-col min-w-[80px]">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-500 font-mono leading-none tracking-tight uppercase">Tier</span>
                        <Sparkles className="w-2.5 h-2.5 text-blue-500/50" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-widest mt-0.5">{tierName}</span>
                </div>

                <div className="h-4 w-px bg-white/10 mx-1" />

                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    {isExpanded ?
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> :
                        <ChevronUp className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300" />
                    }
                </div>
            </motion.div>

            {/* Expanded Permissions List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        className="pointer-events-auto w-80 max-h-[70vh] flex flex-col gap-5 p-5 rounded-4xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                                    <Terminal className="w-4 h-4 text-blue-400" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">Auth Debugger</h3>
                                    <span className="text-[10px] text-blue-400/70 font-mono tracking-tighter">BITWISE_READY_V1</span>
                                </div>
                            </div>
                            <div className="animate-pulse w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>

                        <div className="flex flex-col gap-5 overflow-y-auto pr-2 custom-scrollbar scroll-smooth">
                            {/* Context Section */}
                            <div className="space-y-2.5">
                                <p className="text-[10px] uppercase text-gray-500 font-black tracking-[0.2em] px-1">Context</p>
                                <div className="p-4 rounded-2xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors group/context">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <p className="text-xs text-blue-50 font-semibold truncate">
                                            {activeOrganization?.name || "Personal Context"}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] text-gray-500 font-mono flex items-center justify-between">
                                            <span>ORG_ID</span>
                                            <span className="text-gray-400">{activeOrganization?._id ? String(activeOrganization?._id).substring(0, 16) + "..." : "---"}</span>
                                        </p>
                                        <p className="text-[9px] text-gray-500 font-mono flex items-center justify-between">
                                            <span>USER_ID</span>
                                            <span className="text-gray-400">{String(profile?.id).substring(0, 16)}...</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions Section */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[10px] uppercase text-gray-500 font-black tracking-[0.2em]">Permissions</p>
                                    <span className="text-[9px] font-mono text-gray-600">
                                        {Object.values(permissions).filter(Boolean).length} ACTIVE
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {Object.entries(permissions).length > 0 ? (
                                        Object.entries(permissions).sort((a, b) => b[1] ? 1 : -1).map(([code, granted]) => (
                                            <motion.div
                                                key={code}
                                                layout
                                                className={cn(
                                                    "flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 group/perm",
                                                    granted
                                                        ? "bg-emerald-500/3 border-emerald-500/20 text-emerald-100 hover:border-emerald-500/40"
                                                        : "bg-white/2 border-white/5 text-gray-500 opacity-60 grayscale"
                                                )}
                                            >
                                                <span className="text-[11px] font-mono tracking-tight">{code}</span>
                                                <div className={cn(
                                                    "w-5 h-5 rounded-lg flex items-center justify-center transition-colors",
                                                    granted ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-gray-600"
                                                )}>
                                                    {granted ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-6 rounded-2xl border border-dashed border-white/10 bg-white/2">
                                            <Lock className="w-5 h-5 text-gray-600 mb-2" />
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">No permissions found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-3 text-[9px] font-mono text-gray-600 uppercase tracking-tighter">
                                <span>ENV: {process.env.NODE_ENV}</span>
                                <span>VER: 1.0.4</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-500">
                                <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                LIVE_SYNC
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
