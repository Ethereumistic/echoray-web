"use client"

import { motion } from "framer-motion"
import { Briefcase, ArrowRight, Plus } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import Link from "next/link"

const contentTypes = [
    {
        title: "Work",
        description: "Portfolio projects displayed on the public /work page",
        icon: Briefcase,
        href: "/admin/cms/work",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        glowFrom: "from-blue-500/20",
        glowTo: "to-indigo-500/20",
    },
    // Future content types:
    // { title: "Pricing", ... },
    // { title: "Testimonials", ... },
]

export default function CMSHubPage() {
    const projectCount = useQuery(api.cms.countWorkProjects)

    return (
        <div className="space-y-10">
            <div>
                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-black tracking-tight"
                >
                    Content <span className="text-blue-500">CMS</span>
                </motion.h1>
                <p className="text-muted-foreground mt-2 font-medium">
                    Manage public-facing website content.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentTypes.map((type, i) => (
                    <motion.div
                        key={type.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link href={type.href} className="group relative block">
                            <div className={`absolute -inset-0.5 bg-linear-to-br ${type.glowFrom} ${type.glowTo} rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all blur`} />
                            <div className="relative p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5 group-hover:border-white/10 transition-all">
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`size-14 rounded-2xl ${type.bgColor} flex items-center justify-center border ${type.borderColor}`}>
                                        <type.icon className={`size-6 ${type.color}`} />
                                    </div>
                                    <ArrowRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2">{type.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {type.description}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[10px] text-zinc-500 font-mono tracking-tight font-bold uppercase">
                                            {type.title === "Work"
                                                ? `${projectCount ?? "—"} projects`
                                                : "Coming soon"
                                            }
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:text-blue-300 transition-colors">
                                        Manage →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}

                {/* Placeholder for future content types */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3 min-h-[260px]"
                >
                    <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                        <Plus className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">More content types coming soon</p>
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Pricing • Testimonials • Blog</p>
                </motion.div>
            </div>
        </div>
    )
}
