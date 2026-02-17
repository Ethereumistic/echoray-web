"use client"

import { useState, useEffect } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Doc } from "../../../convex/_generated/dataModel"
import { motion } from "framer-motion"
import {
    Save,
    Shield,
    AlertTriangle,
    Zap,
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
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface PermissionEditorProps {
    permission?: Doc<"permissions"> | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PermissionEditor({ permission, open, onOpenChange }: PermissionEditorProps) {
    const isEditing = !!permission
    const allPermissions = useQuery(api.admin.listPermissions)
    const createPermission = useMutation(api.admin.createPermission)
    const updatePermission = useMutation(api.admin.updatePermission)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        bitPosition: 0,
        category: "basic",
        description: "",
        isAddon: false,
        addonPriceEur: 0,
        isDangerous: false,
        minTier: ""
    })

    useEffect(() => {
        if (permission) {
            setFormData({
                code: permission.code,
                name: permission.name,
                bitPosition: permission.bitPosition,
                category: permission.category,
                description: permission.description || "",
                isAddon: permission.isAddon,
                addonPriceEur: permission.addonPriceEur || 0,
                isDangerous: permission.isDangerous,
                minTier: permission.minTier || ""
            })
        } else {
            // Suggest next available bit position
            const nextBit = allPermissions
                ? Math.max(...allPermissions.map((p: Doc<"permissions">) => p.bitPosition), -1) + 1
                : 0

            setFormData({
                code: "",
                name: "",
                bitPosition: nextBit,
                category: "basic",
                description: "",
                isAddon: false,
                addonPriceEur: 0,
                isDangerous: false,
                minTier: ""
            })
        }
    }, [permission, open, allPermissions])

    const bitConflict = allPermissions?.find(
        (p: Doc<"permissions">) => p.bitPosition === formData.bitPosition && p._id !== permission?._id
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (bitConflict) {
            toast.error(`Bit position ${formData.bitPosition} is already used by ${bitConflict.name}`)
            return
        }

        setLoading(true)
        try {
            if (isEditing) {
                await updatePermission({
                    id: permission._id,
                    name: formData.name,
                    code: formData.code,
                    bitPosition: formData.bitPosition,
                    category: formData.category,
                    description: formData.description,
                    isDangerous: formData.isDangerous
                })
                toast.success("Permission registry updated")
            } else {
                await createPermission({
                    ...formData,
                    addonPriceEur: formData.isAddon ? formData.addonPriceEur : undefined,
                    minTier: formData.minTier || undefined
                })
                toast.success("New permission registered")
            }
            onOpenChange(false)
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save permission"
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl bg-zinc-950 border-white/5 p-0 rounded-[2.5rem] overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="p-8 border-b border-white/5 bg-zinc-950">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Shield className="size-6 text-emerald-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-white">
                                    {isEditing ? `Configure Permission` : "Register Permission"}
                                </DialogTitle>
                                <p className="text-xs text-muted-foreground mt-1 font-medium italic">
                                    {isEditing ? "Modify bitwise logic and categorization" : "Define a new bit position in the infrastructure"}
                                </p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="p-name" className="text-xs font-bold text-zinc-400 ml-1">Friendly Name</Label>
                                <Input
                                    id="p-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Advanced Analytics"
                                    className="bg-white/5 border-white/5 rounded-2xl h-12 px-4 focus:ring-emerald-500/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="p-code" className="text-xs font-bold text-zinc-400 ml-1">System Code (string)</Label>
                                <Input
                                    id="p-code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="e.g. analytics.advanced"
                                    className="bg-white/5 border-white/5 rounded-2xl h-12 px-4 font-mono text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <Label htmlFor="p-bit" className="text-xs font-bold text-zinc-400">Bit Position (0-53)</Label>
                                    {bitConflict && (
                                        <span className="text-[9px] font-black text-red-400 uppercase tracking-tight flex items-center gap-1">
                                            <AlertTriangle className="size-3" /> Conflict: {bitConflict.code}
                                        </span>
                                    )}
                                </div>
                                <Input
                                    id="p-bit"
                                    type="number"
                                    value={formData.bitPosition}
                                    onChange={(e) => setFormData({ ...formData, bitPosition: parseInt(e.target.value) })}
                                    className={cn(
                                        "bg-white/5 border-white/5 rounded-2xl h-12 px-4 font-black text-lg",
                                        bitConflict ? "border-red-500/50 bg-red-500/5 text-red-200" : "text-emerald-400"
                                    )}
                                    required
                                    min={0}
                                    max={53}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="p-cat" className="text-xs font-bold text-zinc-400 ml-1">Category</Label>
                                <Input
                                    id="p-cat"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. analytics"
                                    className="bg-white/5 border-white/5 rounded-2xl h-12 px-4"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="p-desc" className="text-xs font-bold text-zinc-400 ml-1">Internal Description</Label>
                            <Textarea
                                id="p-desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="bg-white/5 border-white/5 rounded-3xl min-h-[80px] p-4"
                                placeholder="Explain what this bit unlocks..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div
                                className={cn(
                                    "p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4",
                                    formData.isDangerous
                                        ? "bg-red-500/10 border-red-500/30"
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                                onClick={() => setFormData({ ...formData, isDangerous: !formData.isDangerous })}
                            >
                                <div className={cn("size-10 rounded-xl flex items-center justify-center", formData.isDangerous ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-500")}>
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-black uppercase tracking-tight text-white mb-0.5">Dangerous Bit</div>
                                    <div className="text-[10px] text-zinc-500 font-medium">Restricted to staff/system admins</div>
                                </div>
                                <Checkbox checked={formData.isDangerous} className="border-zinc-700 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500" />
                            </div>

                            <div
                                className={cn(
                                    "p-4 rounded-[2rem] border transition-all cursor-pointer flex items-center gap-4",
                                    formData.isAddon
                                        ? "bg-blue-500/10 border-blue-500/30"
                                        : "bg-white/5 border-white/5 hover:bg-white/10"
                                )}
                                onClick={() => setFormData({ ...formData, isAddon: !formData.isAddon })}
                            >
                                <div className={cn("size-10 rounded-xl flex items-center justify-center", formData.isAddon ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-500")}>
                                    <Zap className="size-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-black uppercase tracking-tight text-white mb-0.5">Commercial Addon</div>
                                    <div className="text-[10px] text-zinc-500 font-medium">Available for independent purchase</div>
                                </div>
                                <Checkbox checked={formData.isAddon} className="border-zinc-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500" />
                            </div>
                        </div>

                        {formData.isAddon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-6 rounded-[2rem] bg-blue-600/5 border border-blue-500/10 space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="p-price" className="text-[10px] font-black uppercase tracking-widest text-blue-400 ml-1">Addon Price (EUR/mo)</Label>
                                    <Input
                                        id="p-price"
                                        type="number"
                                        value={formData.addonPriceEur}
                                        onChange={(e) => setFormData({ ...formData, addonPriceEur: parseInt(e.target.value) })}
                                        className="bg-black/50 border-blue-500/20 rounded-2xl h-12 px-4 focus:ring-blue-500/20 font-bold"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <DialogFooter className="p-8 border-t border-white/5 bg-zinc-950 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-[11px] text-zinc-500 hover:text-white"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !!bitConflict}
                            className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-emerald-500/20"
                        >
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="size-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                            ) : (
                                <Save className="size-4 mr-2" />
                            )}
                            {isEditing ? "Sync Registry" : "Initialize Bit"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
