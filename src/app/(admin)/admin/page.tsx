"use client"

import { motion } from "framer-motion"
import { Shield, CreditCard, History, Users, Activity, Terminal } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export default function AdminOverviewPage() {
    const tiers = useQuery(api.admin.listTiers)
    const permissions = useQuery(api.admin.listPermissions)

    const stats = [
        { label: "Active Tiers", value: tiers?.length || 0, icon: CreditCard, color: "text-blue-400" },
        { label: "Total Permissions", value: permissions?.length || 0, icon: Shield, color: "text-emerald-400" },
        { label: "Staff Members", value: "---", icon: Users, color: "text-purple-400" },
        { label: "System Status", value: "Healthy", icon: Activity, color: "text-blue-400" },
    ]

    return (
        <div className="space-y-10">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tight"
                >
                    Godmode <span className="text-blue-500">Overview</span>
                </motion.h1>
                <p className="text-muted-foreground mt-2 font-medium">
                    Comprehensive access to core Echoray infrastructure.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-4xl bg-blue-600/5 border border-blue-500/10 space-y-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <stat.icon className={stat.color} />
                            <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-black">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 shadow-xl shadow-blue-500/20 text-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Terminal className="size-5 text-blue-400" />
                        System Integrity
                    </h3>
                    <p className="text-sm text-blue-100/70 mb-6 leading-relaxed">
                        All bitwise permission checks are currently active. System administrators have full authority to modify commercial tiers and master permission codes.
                    </p>
                    <div className="space-y-4">
                        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase flex justify-between">
                            <span>Bitwise Engine v1.0.4</span>
                            <span className="text-emerald-400">Stable</span>
                        </p>
                    </div>
                </div>

                <div className="p-8 rounded-[40px] bg-white/5 border border-white/10">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <History className="size-5 text-muted-foreground" />
                        Recent Admin Actions
                    </h3>
                    <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground italic border-b border-white/5 pb-4">
                            No recent logs found.
                        </div>
                        <div className="flex justify-end">
                            <button className="text-[10px] uppercase font-black tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                                View Full Audit Log →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

