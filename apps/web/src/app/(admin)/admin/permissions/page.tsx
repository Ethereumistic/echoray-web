"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Doc } from "../../../../../convex/_generated/dataModel"
import { motion } from "framer-motion"
import {
    Plus,
    Shield,
    Lock,
    Edit,
    Zap,
    Terminal,
    Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PermissionEditor } from "@/components/admin/permission-editor"

export default function PermissionsPage() {
    const permissions = useQuery(api.admin.listPermissions)
    const [search, setSearch] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [editingPermission, setEditingPermission] = useState<Doc<"permissions"> | null>(null)

    const filteredPermissions = permissions?.filter((p: Doc<"permissions">) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.code.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    )

    const categories = Array.from(new Set(filteredPermissions?.map((p: Doc<"permissions">) => p.category) || []))

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        Bitwise <span className="text-emerald-500">Registry</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Master index of platform permissions and commercial bits.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                        <Input
                            placeholder="Scan bits..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-[300px] bg-white/5 border-white/5 pl-11 rounded-2xl h-12 focus:ring-emerald-500/10 placeholder:text-zinc-600"
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreating(true)}
                        className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-6 shadow-xl shadow-emerald-500/20"
                    >
                        <Plus className="size-5" />
                        Initialize Bit
                    </Button>
                </div>
            </div>

            <div className="space-y-12">
                {permissions ? (
                    categories.length > 0 ? (
                        categories.map((category: string, idx: number) => (
                            <motion.div
                                key={category}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-4 px-2">
                                    <div className="h-px flex-1 bg-linear-to-r from-emerald-500/20 to-transparent" />
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/70 italic shrink-0">
                                        {category}
                                    </h3>
                                    <div className="h-px flex-1 bg-linear-to-l from-emerald-500/20 to-transparent" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredPermissions
                                        ?.filter((p: Doc<"permissions">) => p.category === category)
                                        .map((p: Doc<"permissions">) => (
                                            <div
                                                key={p._id}
                                                className="group relative"
                                            >
                                                <div className="absolute -inset-0.5 bg-linear-to-br from-emerald-500/20 to-blue-500/20 rounded-4xl opacity-0 group-hover:opacity-100 transition-all blur" />
                                                <div className="relative p-6 rounded-4xl bg-zinc-900 border border-white/5 group-hover:border-white/10 transition-all">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={cn(
                                                            "size-12 rounded-2xl flex items-center justify-center border transition-all",
                                                            p.isDangerous
                                                                ? "bg-red-500/5 border-red-500/20 text-red-500"
                                                                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                                        )}>
                                                            {p.isDangerous ? <Lock className="size-5" /> : <Shield className="size-5" />}
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] font-mono text-zinc-600 uppercase tracking-tighter mb-1">Position</div>
                                                            <div className="size-8 rounded-full bg-black flex items-center justify-center border border-white/5 font-black text-sm text-emerald-400">
                                                                {p.bitPosition}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 mb-6">
                                                        <h4 className="text-lg font-bold text-white leading-tight">{p.name}</h4>
                                                        <p className="text-[10px] font-mono text-blue-400 flex items-center gap-1.5">
                                                            <Terminal className="size-3" />
                                                            {p.code}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed h-[34px]">
                                                            {p.description || "No registry documentation available."}
                                                        </p>

                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            {p.isAddon && (
                                                                <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                                                                    <Zap className="size-3 text-blue-400" />
                                                                    <span className="text-[9px] font-black uppercase tracking-tight text-blue-400">Addon • €{p.addonPriceEur}</span>
                                                                </div>
                                                            )}
                                                            {p.minTier && (
                                                                <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-tight text-zinc-400">
                                                                    Min: {p.minTier}
                                                                </div>
                                                            )}
                                                            {p.isDangerous && (
                                                                <div className="px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-[9px] font-black uppercase tracking-tight text-red-400">
                                                                    INTERNAL ONLY
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 pt-6 border-t border-white/5 flex justify-end">
                                                        <button
                                                            onClick={() => setEditingPermission(p)}
                                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-400 transition-colors"
                                                        >
                                                            Configure <Edit className="size-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-4xl">
                            <p className="text-zinc-500 font-medium">No bits found matching your scan filter.</p>
                        </div>
                    )
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-4xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                )}
            </div>

            <PermissionEditor
                open={isCreating || !!editingPermission}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreating(false)
                        setEditingPermission(null)
                    }
                }}
                permission={editingPermission}
            />
        </div>
    )
}
