"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import type { Doc, Id } from "../../../../../../convex/_generated/dataModel"
import { motion } from "framer-motion"
import {
    Plus,
    Search,
    Trash2,
    ExternalLink,
    ArrowLeft,
    Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function WorkProjectsPage() {
    const projects = useQuery(api.cms.listWorkProjects)
    const deleteProject = useMutation(api.cms.deleteWorkProject)
    const router = useRouter()

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [deleteTarget, setDeleteTarget] = useState<Id<"workProjects"> | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const filtered = projects?.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "published" && p.isPublished) ||
            (statusFilter === "draft" && !p.isPublished)
        return matchesSearch && matchesStatus
    })

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await deleteProject({ id: deleteTarget })
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link
                            href="/admin/cms"
                            className="text-muted-foreground hover:text-white transition-colors"
                        >
                            <ArrowLeft className="size-5" />
                        </Link>
                        <motion.h1
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tight"
                        >
                            Work <span className="text-blue-500">Projects</span>
                        </motion.h1>
                    </div>
                    <p className="text-muted-foreground font-medium ml-8">
                        Manage portfolio projects displayed on the public /work page.
                    </p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 shadow-xl shadow-blue-500/20"
                    onClick={() => router.push("/admin/cms/work/new")}
                >
                    <Plus className="size-5" />
                    Add Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-zinc-900 border-white/10 h-11"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 bg-zinc-900 border-white/10 h-11">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Drafts</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            {projects === undefined ? (
                <div className="h-64 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="size-8 border-t-2 border-blue-500 rounded-full"
                    />
                    <p className="text-zinc-500 font-medium">Loading projects...</p>
                </div>
            ) : filtered && filtered.length > 0 ? (
                <div className="rounded-4xl bg-zinc-900 border border-white/5 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 pl-6">Preview</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Title</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Link</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Published</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 text-right pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((project: Doc<"workProjects">, i: number) => (
                                <motion.tr
                                    key={project._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="border-white/5 hover:bg-white/2 cursor-pointer transition-colors group"
                                    onClick={() => router.push(`/admin/cms/work/${project._id}`)}
                                >
                                    <TableCell className="pl-6">
                                        <div className="size-12 rounded-xl overflow-hidden border border-white/10 bg-zinc-800">
                                            <img
                                                src={project.thumbnail}
                                                alt={project.title}
                                                className="size-full object-cover"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-bold text-white">{project.title}</span>
                                        {project.tagline && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{project.tagline}</p>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {project.link.replace(/^https?:\/\//, "")}
                                            <ExternalLink className="size-3" />
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={project.status === "completed" ? "default" : "secondary"}
                                            className={
                                                project.status === "completed"
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }
                                        >
                                            {project.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className={`size-2 rounded-full ${project.isPublished ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-600"}`} />
                                            <span className="text-[10px] font-mono font-bold uppercase text-zinc-500">
                                                {project.isPublished ? "Live" : "Draft"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteTarget(project._id)
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="h-64 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                    <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Briefcase className="size-7 text-blue-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold mb-1">No projects yet</p>
                        <p className="text-sm text-muted-foreground">Create your first work project to get started.</p>
                    </div>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        onClick={() => router.push("/admin/cms/work/new")}
                    >
                        <Plus className="size-4" />
                        Add Project
                    </Button>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
