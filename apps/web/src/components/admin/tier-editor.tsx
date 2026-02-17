"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { motion } from "framer-motion"
import {
    Save,
    CreditCard,
    Building2,
    Shield,
    Terminal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { BitwisePermissionSelector } from "./bitwise-selector"
import { toast } from "sonner"
import type { Doc } from "../../../convex/_generated/dataModel"

interface TierData extends Doc<"subscriptionTiers"> {
    _id: Doc<"subscriptionTiers">["_id"]
}

interface TierEditorProps {
    tier?: TierData | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TierEditor({ tier, open, onOpenChange }: TierEditorProps) {
    const isEditing = !!tier
    const createTier = useMutation(api.admin.createTier)
    const updateTier = useMutation(api.admin.updateTier)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        type: "commercial" as "commercial" | "system",
        priceEur: 0,
        isCustom: false,
        basePermissions: 0,
        maxOrganizations: 1,
        maxMembers: 1,
        description: ""
    })

    useEffect(() => {
        if (tier) {
            setFormData({
                name: tier.name,
                slug: tier.slug,
                type: tier.type,
                priceEur: tier.priceEur,
                isCustom: tier.isCustom,
                basePermissions: tier.basePermissions,
                maxOrganizations: tier.maxOrganizations,
                maxMembers: tier.maxMembers || 0,
                description: tier.description || ""
            })
        } else {
            setFormData({
                name: "",
                slug: "",
                type: "commercial",
                priceEur: 0,
                isCustom: false,
                basePermissions: 0,
                maxOrganizations: 1,
                maxMembers: 1,
                description: ""
            })
        }
    }, [tier, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isEditing) {
                await updateTier({
                    id: tier._id,
                    name: formData.name,
                    priceEur: formData.priceEur,
                    basePermissions: formData.basePermissions,
                    maxMembers: formData.maxMembers === 0 ? undefined : formData.maxMembers,
                    maxOrganizations: formData.maxOrganizations,
                    description: formData.description
                })
                toast.success("Tier updated successfully")
            } else {
                await createTier({
                    ...formData,
                    maxMembers: formData.maxMembers === 0 ? undefined : formData.maxMembers
                })
                toast.success("Tier created successfully")
            }
            onOpenChange(false)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save tier"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-white/5 p-0 rounded-[2.5rem] scroll-smooth custom-scrollbar">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <DialogHeader className="p-8 border-b border-white/5 sticky top-0 bg-zinc-950 z-10">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <CreditCard className="size-6 text-blue-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white">
                                    {isEditing ? `Edit ${tier.name}` : "Create New Tier"}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                                    {isEditing ? "Modify tier limits and granular access" : "Establish a new access level for the platform"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-10">
                        {/* Section 1: Basic Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Terminal className="size-4 text-zinc-500" />
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400">Basic Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-xs font-bold text-zinc-400 ml-1">Display Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Enterprise"
                                        className="bg-white/5 border-white/5 rounded-2xl h-12 px-4 focus:ring-blue-500/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug" className="text-xs font-bold text-zinc-400 ml-1">System Slug</Label>
                                    <Input
                                        id="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        placeholder="e.g. enterprise"
                                        disabled={isEditing}
                                        className="bg-white/5 border-white/5 rounded-2xl h-12 px-4 focus:ring-blue-500/20 disabled:opacity-50"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-xs font-bold text-zinc-400 ml-1">Price (EUR/mo)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={formData.priceEur}
                                        onChange={(e) => setFormData({ ...formData, priceEur: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/5 rounded-2xl h-12 px-4 focus:ring-blue-500/20"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-zinc-400 ml-1">Tier Category</Label>
                                    <div className="flex p-1 rounded-2xl bg-white/5 border border-white/5 h-12 gap-1">
                                        {(['commercial', 'system'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: t })}
                                                disabled={isEditing}
                                                className={cn(
                                                    "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
                                                    formData.type === t ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold text-zinc-400 ml-1">Marketing Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Tier benefits description..."
                                    className="bg-white/5 border-white/5 rounded-3xl min-h-[100px] p-6 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {/* Section 2: Limits */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="size-4 text-zinc-500" />
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-400">Hard Limits</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="maxOrgs" className="text-xs font-bold text-zinc-400 ml-1 font-mono">MAX_ORGANIZATIONS</Label>
                                    <Input
                                        id="maxOrgs"
                                        type="number"
                                        value={formData.maxOrganizations}
                                        onChange={(e) => setFormData({ ...formData, maxOrganizations: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/5 rounded-2xl h-12 px-4"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxMembers" className="text-xs font-bold text-zinc-400 ml-1 font-mono">MAX_MEMBERS (0 = ∞)</Label>
                                    <Input
                                        id="maxMembers"
                                        type="number"
                                        value={formData.maxMembers}
                                        onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                                        className="bg-white/5 border-white/5 rounded-2xl h-12 px-4"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Bitwise Permissions */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="size-4 text-blue-400" />
                                <h3 className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-400">Bitwise Permission Registry</h3>
                            </div>
                            <BitwisePermissionSelector
                                value={formData.basePermissions}
                                onChange={(val) => setFormData({ ...formData, basePermissions: val })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-8 border-t border-white/5 bg-zinc-950 sticky bottom-0 z-10 flex flex-col sm:flex-row gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] text-zinc-500 hover:text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-blue-500/20"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="size-4 border-2 border-white/20 border-t-white rounded-full mr-2"
                                />
                            ) : (
                                <Save className="size-4 mr-2" />
                            )}
                            {isEditing ? "Commit Changes" : "Deploy Tier"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
