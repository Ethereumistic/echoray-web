"use client"

import { useState } from "react"
import {
    ShieldAlert,
    Cpu,
    Activity,
    Globe,
    Lock,
    Zap,
    RefreshCcw
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        authOverride: false,
        maintenanceMode: false,
        debugLogs: true,
        bitwiseV2: true,
        apiStrict: true,
        globalInvite: false
    })

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const sections = [
        {
            title: "Security & Access",
            items: [
                { id: "authOverride", label: "Auth Bypass Override", desc: "Allow staff to bypass standard organization checks.", icon: ShieldAlert, color: "text-red-400" },
                { id: "globalInvite", label: "Global Organization Invitations", desc: "Allows staff to invite anyone to any organization.", icon: Globe, color: "text-blue-400" },
                { id: "apiStrict", label: "Strict API Validation", desc: "Enforces schema validation on all Convex mutations.", icon: Lock, color: "text-emerald-400" }
            ]
        },
        {
            title: "Infrastructure & Engine",
            items: [
                { id: "bitwiseV2", label: "Bitwise Engine V2", desc: "Optimized 53-bit permission computation logic.", icon: Cpu, color: "text-purple-400" },
                { id: "maintenanceMode", label: "Platform Maintenance", desc: "Disable all non-staff access for structural updates.", icon: Activity, color: "text-yellow-400" },
                { id: "debugLogs", label: "Extended Telemetry", desc: "Capture verbose logs for all administrative actions.", icon: Zap, color: "text-orange-400" }
            ]
        }
    ]

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        System <span className="text-blue-500">Settings</span>
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Global infrastructure parameters and security controls.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Registry Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="space-y-6"
                    >
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic pl-2">
                            {section.title}
                        </h3>
                        <div className="rounded-[3rem] bg-zinc-900 border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-1 divide-y divide-white/5">
                                {section.items.map((item) => (
                                    <div key={item.id} className="p-8 flex items-center justify-between group hover:bg-white/2 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className={cn("size-12 rounded-2xl flex items-center justify-center border bg-zinc-800 border-white/5", item.color)}>
                                                <item.icon className="size-6" />
                                            </div>
                                            <div className="max-w-[240px]">
                                                <Label htmlFor={item.id} className="text-base font-bold text-white mb-1 block cursor-pointer">{item.label}</Label>
                                                <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            id={item.id}
                                            checked={settings[item.id as keyof typeof settings]}
                                            onCheckedChange={() => toggleSetting(item.id as keyof typeof settings)}
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-10 rounded-[4rem] bg-linear-to-br from-blue-600/5 to-transparent border border-blue-500/10 flex flex-col items-center gap-4 text-center">
                <div className="size-16 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <RefreshCcw className="size-8 text-blue-400 opacity-50" />
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-blue-400 mb-2">Infrastructure Sealed</p>
                    <p className="text-sm text-blue-100/40 max-w-lg">
                        Structural parameters are currently read-only. Modification requires signed environment variables or high-level staff override.
                    </p>
                </div>
            </div>
        </div>
    )
}
