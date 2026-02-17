"use client"

import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Doc } from "../../../convex/_generated/dataModel"
import { Check, ShieldAlert, Info, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface BitwisePermissionSelectorProps {
    value: number
    onChange: (newValue: number) => void
    disabled?: boolean
}

export function BitwisePermissionSelector({ value, onChange, disabled }: BitwisePermissionSelectorProps) {
    const permissions = useQuery(api.admin.listPermissions)

    const togglePermission = (bitPosition: number) => {
        if (disabled) return

        const bitValue = BigInt(1) << BigInt(bitPosition)
        const hasBit = (BigInt(value) & bitValue) !== 0n

        if (hasBit) {
            onChange(Number(BigInt(value) & ~bitValue))
        } else {
            onChange(Number(BigInt(value) | bitValue))
        }
    }

    if (!permissions) {
        return <div className="h-40 rounded-3xl bg-white/5 animate-pulse" />
    }

    // Group permissions by category
    const categories = Array.from(new Set(permissions.map((p: Doc<"permissions">) => p.category)))

    return (
        <div className="space-y-6">
            {categories.map((category) => (
                <div key={category} className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1 italic">
                        {category}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions
                            .filter((p: Doc<"permissions">) => p.category === category)
                            .map((p: Doc<"permissions">) => {
                                const isSelected = (BigInt(value) & (BigInt(1) << BigInt(p.bitPosition))) !== 0n

                                return (
                                    <button
                                        key={p._id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => togglePermission(p.bitPosition)}
                                        className={cn(
                                            "flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 text-left group",
                                            isSelected
                                                ? "bg-blue-600/10 border-blue-500/30 text-blue-100 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                                : "bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-white/[0.02]"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "size-8 rounded-xl flex items-center justify-center transition-colors",
                                                isSelected ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-zinc-600 group-hover:bg-white/10"
                                            )}>
                                                {p.isDangerous ? (
                                                    <ShieldAlert className="size-4" />
                                                ) : (
                                                    <Check className={cn("size-4 transition-transform", isSelected ? "scale-100" : "scale-0")} />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold leading-none">{p.name}</span>
                                                <span className="text-[9px] font-mono mt-1 opacity-50">{p.code} (Bit {p.bitPosition})</span>
                                            </div>
                                        </div>
                                        {p.isDangerous && (
                                            <div className="p-1 rounded-md bg-red-500/10 text-red-400">
                                                <Lock className="size-3" />
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                    </div>
                </div>
            ))}

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-start mt-8">
                <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-100/60 leading-relaxed font-medium">
                    Calculated Bitset: <span className="text-blue-400 font-mono">0x{value.toString(16).toUpperCase()}</span> ({value.toString()}).
                    This integer will be stored in the repository and used for lightning-fast server-side permission checks.
                </p>
            </div>
        </div>
    )
}
