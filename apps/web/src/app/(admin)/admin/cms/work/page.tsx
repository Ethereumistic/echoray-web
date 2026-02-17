"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../../convex/_generated/api"
import type { Doc, Id } from "../../../../../../convex/_generated/dataModel"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, Search, Trash2, ExternalLink, ArrowLeft, Briefcase,
    GripVertical, ChevronUp, ChevronDown, Eye, EyeOff
} from "lucide-react"
import { Button } from "@echoray/ui/components/ui/button"
import { Input } from "@echoray/ui/components/ui/input"
import { Badge } from "@echoray/ui/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@echoray/ui/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@echoray/ui/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// ── Sortable Project Card ────────────────────────────────────────

function SortableProjectCard({
    project,
    index,
    totalCount,
    onMoveUp,
    onMoveDown,
    onDelete,
    dragDisabled,
}: {
    project: Doc<"workProjects">
    index: number
    totalCount: number
    onMoveUp: () => void
    onMoveDown: () => void
    onDelete: () => void
    dragDisabled?: boolean
}) {
    const router = useRouter()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project._id, disabled: dragDisabled })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative ${isDragging ? "opacity-50" : ""}`}
        >
            <div
                className={`flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border transition-all cursor-pointer ${isDragging
                    ? "border-blue-500/40 shadow-xl shadow-blue-500/10 scale-[1.02]"
                    : "border-white/5 hover:border-white/10"
                    }`}
                onClick={() => router.push(`/admin/cms/work/${project._id}`)}
            >
                {/* Order Controls */}
                <div className="flex flex-col items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-white disabled:opacity-20"
                        disabled={index === 0}
                        onClick={onMoveUp}
                    >
                        <ChevronUp className="size-4" />
                    </Button>
                    <span className="text-[10px] font-mono font-bold text-muted-foreground/50 w-6 text-center">
                        {project.order}
                    </span>
                    <Button
                        variant="ghost" size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-white disabled:opacity-20"
                        disabled={index === totalCount - 1}
                        onClick={onMoveDown}
                    >
                        <ChevronDown className="size-4" />
                    </Button>
                </div>

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="shrink-0 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical className="size-5" />
                </div>

                {/* Thumbnail */}
                <div className="size-14 rounded-xl overflow-hidden border border-white/10 bg-zinc-800 shrink-0">
                    <img src={project.thumbnail} alt={project.title}
                        className="size-full object-cover" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-white text-sm truncate">{project.title}</span>
                        {project.projectType && (
                            <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400 border-white/5 shrink-0">
                                {project.projectType}
                            </Badge>
                        )}
                    </div>
                    {project.tagline && (
                        <p className="text-xs text-muted-foreground truncate max-w-lg">{project.tagline}</p>
                    )}
                    {project.description && (
                        <p className="text-xs text-muted-foreground/50 truncate max-w-md mt-0.5">
                            {project.description}
                        </p>
                    )}
                </div>

                {/* Link */}
                <a href={project.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0 max-w-[200px] truncate"
                    onClick={(e) => e.stopPropagation()}>
                    {project.link.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                    <ExternalLink className="size-3 shrink-0" />
                </a>

                {/* Status Badge */}
                <Badge variant={project.status === "completed" ? "default" : "secondary"}
                    className={`shrink-0 text-[10px] ${project.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                    {project.status}
                </Badge>

                {/* Published Indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {project.isPublished ? (
                        <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <Eye className="size-3.5 text-emerald-500/60" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full bg-zinc-600" />
                            <EyeOff className="size-3.5 text-zinc-600" />
                        </div>
                    )}
                </div>

                {/* Delete */}
                <Button variant="ghost" size="icon"
                    className="size-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    onClick={(e) => { e.stopPropagation(); onDelete() }}>
                    <Trash2 className="size-4" />
                </Button>
            </div>
        </div>
    )
}

// ── Main Page ────────────────────────────────────────────────────

export default function WorkProjectsPage() {
    const projects = useQuery(api.cms.listWorkProjects)
    const deleteProject = useMutation(api.cms.deleteWorkProject)
    const reorderProjects = useMutation(api.cms.reorderWorkProjects)
    const router = useRouter()

    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [deleteTarget, setDeleteTarget] = useState<Id<"workProjects"> | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const sorted = projects ? [...projects].sort((a, b) => a.order - b.order) : undefined

    const filtered = sorted?.filter((p) => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "published" && p.isPublished) ||
            (statusFilter === "draft" && !p.isPublished)
        return matchesSearch && matchesStatus
    })

    const isFiltering = search.length > 0 || statusFilter !== "all"

    const handleDelete = async () => {
        if (!deleteTarget) return
        setIsDeleting(true)
        try {
            await deleteProject({ id: deleteTarget })
            toast.success("Project deleted")
        } finally {
            setIsDeleting(false)
            setDeleteTarget(null)
        }
    }

    // ── Drag End Handler ──
    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event
        if (!over || active.id === over.id || !filtered) return

        const oldIndex = filtered.findIndex(p => p._id === active.id)
        const newIndex = filtered.findIndex(p => p._id === over.id)
        if (oldIndex === -1 || newIndex === -1) return

        const reordered = arrayMove(filtered, oldIndex, newIndex)
        const newOrders = reordered.map((p, i) => ({ id: p._id, order: i }))

        await reorderProjects({ orders: newOrders })
        toast.success("Order updated")
    }, [filtered, reorderProjects])

    // ── Arrow Move Handler ──
    const moveProject = useCallback(async (projectId: Id<"workProjects">, direction: "up" | "down") => {
        if (!filtered) return
        const currentIndex = filtered.findIndex(p => p._id === projectId)
        if (currentIndex === -1) return

        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
        if (targetIndex < 0 || targetIndex >= filtered.length) return

        const reordered = arrayMove(filtered, currentIndex, targetIndex)
        const newOrders = reordered.map((p, i) => ({ id: p._id, order: i }))

        await reorderProjects({ orders: newOrders })
        toast.success("Order updated")
    }, [filtered, reorderProjects])

    const totalProjects = projects?.length ?? 0

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/cms" className="text-muted-foreground hover:text-white transition-colors">
                            <ArrowLeft className="size-5" />
                        </Link>
                        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tight">
                            Work <span className="text-blue-500">Projects</span>
                        </motion.h1>
                        {totalProjects > 0 && (
                            <span className="text-sm font-bold text-muted-foreground bg-zinc-800 px-3 py-1 rounded-full">
                                {totalProjects}
                            </span>
                        )}
                    </div>
                    <p className="text-muted-foreground font-medium ml-8">
                        Drag to reorder • Projects appear on /work in this exact order.
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

            {/* Filtering Warning */}
            {isFiltering && (
                <p className="text-xs text-amber-400/80 font-medium">
                    ⚠ Drag reordering is disabled while filtering. Clear filters to reorder.
                </p>
            )}

            {/* Kanban-style Project List */}
            {projects === undefined ? (
                <div className="h-64 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-3">
                    <motion.div animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="size-8 border-t-2 border-blue-500 rounded-full" />
                    <p className="text-zinc-500 font-medium">Loading projects...</p>
                </div>
            ) : filtered && filtered.length > 0 ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filtered.map(p => p._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {filtered.map((project, i) => (
                                <SortableProjectCard
                                    key={project._id}
                                    project={project}
                                    index={i}
                                    totalCount={filtered.length}
                                    onMoveUp={() => moveProject(project._id, "up")}
                                    onMoveDown={() => moveProject(project._id, "down")}
                                    onDelete={() => setDeleteTarget(project._id)}
                                    dragDisabled={isFiltering}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="h-64 rounded-[2.5rem] border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                    <div className="size-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Briefcase className="size-7 text-blue-400" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-bold mb-1">No projects yet</p>
                        <p className="text-sm text-muted-foreground">Create your first work project to get started.</p>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
                        onClick={() => router.push("/admin/cms/work/new")}>
                        <Plus className="size-4" /> Add Project
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
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
