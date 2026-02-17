"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import type { Doc } from "../../../../../convex/_generated/dataModel"
import { motion } from "framer-motion"
import {
    Plus,
    CreditCard,
    ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TierEditor } from "@/components/admin/tier-editor"

export default function TiersPage() {
    const tiers = useQuery(api.admin.listTiers)
    const permissions = useQuery(api.admin.listPermissions)
    const [isCreating, setIsCreating] = useState(false)
    const [editingTier, setEditingTier] = useState<Doc<"subscriptionTiers"> | null>(null)

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        Subscription <span className="text-blue-500">Tiers</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Configure platform access levels and commercial limits.
                    </p>
                </div>
                <Button
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 shadow-xl shadow-blue-500/20"
                    onClick={() => setIsCreating(true)}
                >
                    <Plus className="size-5" />
                    Create New Tier
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {tiers ? (
                    tiers.map((tier: Doc<"subscriptionTiers">, i: number) => (
                        <motion.div
                            key={tier._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative"
                        >
                            <div className="absolute -inset-0.5 bg-linear-to-br from-emerald-500/20 to-blue-500/20 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all blur" />
                            <div className="relative p-6 rounded-[2.5rem] bg-zinc-900 border border-white/5 group-hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                            <CreditCard className="size-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white capitalize">{tier.name}</h3>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 mt-1">
                                                {tier.type} Tier • {tier.slug}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-white">€{tier.priceEur === 0 ? "Free" : tier.priceEur}</div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Per Month</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                        <p className="text-[9px] uppercase font-black tracking-tighter text-muted-foreground mb-1">Max Orgs</p>
                                        <p className="text-lg font-bold">{tier.maxOrganizations === -1 ? "∞" : tier.maxOrganizations}</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                        <p className="text-[9px] uppercase font-black tracking-tighter text-muted-foreground mb-1">Max Members</p>
                                        <p className="text-lg font-bold">{tier.maxMembers || "∞"}</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                        <p className="text-[9px] uppercase font-black tracking-tighter text-muted-foreground mb-1">Price/m</p>
                                        <p className="text-lg font-bold">€{tier.priceEur}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <p className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em]">Base Permissions</p>
                                        <p className="text-[10px] font-mono text-zinc-600">MASK: 0x{tier.basePermissions.toString(16).toUpperCase()}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 p-5 rounded-4xl bg-black/40 border border-white/5">
                                        {permissions?.map((p: Doc<"permissions">) => {
                                            const hasPerm = (BigInt(tier.basePermissions) & (BigInt(1) << BigInt(p.bitPosition))) !== 0n
                                            if (!hasPerm) return null
                                            return (
                                                <div
                                                    key={p._id}
                                                    className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"
                                                >
                                                    <div className="size-1.5 rounded-full bg-emerald-400" />
                                                    <span className="text-[10px] font-bold text-emerald-100 uppercase">{p.code}</span>
                                                </div>
                                            )
                                        })}
                                        <button
                                            onClick={() => setEditingTier(tier)}
                                            className="px-3 py-1.5 rounded-full bg-white/5 border border-dashed border-white/10 text-[10px] font-bold text-muted-foreground hover:bg-white/10 transition-all"
                                        >
                                            + Configure
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] text-zinc-500 font-mono tracking-tight font-bold">STABLE_RELEASE</span>
                                    </div>
                                    <button
                                        onClick={() => setEditingTier(tier)}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        Edit Full Config <ChevronRight className="size-3" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full h-64 rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="size-8 border-t-2 border-blue-500 rounded-full"
                        />
                        <p className="text-zinc-500 font-medium">Syncing commercial registry...</p>
                    </div>
                )}
            </div>

            <TierEditor
                open={isCreating || !!editingTier}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreating(false)
                        setEditingTier(null)
                    }
                }}
                tier={editingTier}
            />
        </div>
    )
}
