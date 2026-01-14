"use client"

import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Plus, Folder, Lock, Loader2, Trash2, User } from 'lucide-react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Personal Projects page.
 * Lists all personal projects for the current user with real Convex data.
 * Route: /p/[username]/projects
 * Uses project.create permission check for gating.
 */
export default function PersonalProjectsPage() {
    const params = useParams()
    const username = params.slug as string
    const { profile } = useAuthStore()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    // Fetch personal projects from Convex (no organizationId = personal)
    const projects = useQuery(api.projects.listMyProjects, {})
    const canCreateResult = useQuery(api.projects.canCreateProject)
    const createProject = useMutation(api.projects.createProject)
    const deleteProject = useMutation(api.projects.deleteProject)

    const canCreate = canCreateResult?.canCreate ?? false
    const isLoading = projects === undefined
    const displayName = profile?.displayName || username

    const handleCreateProject = async () => {
        if (!projectName.trim()) return

        setIsCreating(true)
        try {
            await createProject({
                name: projectName.trim(),
                description: projectDescription.trim() || undefined,
                // No organizationId = personal project
            })
            setProjectName('')
            setProjectDescription('')
            setIsDialogOpen(false)
        } catch (error) {
            console.error('Failed to create project:', error)
            alert(error instanceof Error ? error.message : 'Failed to create project')
        } finally {
            setIsCreating(false)
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return

        try {
            await deleteProject({ id: projectId as any })
        } catch (error) {
            console.error('Failed to delete project:', error)
            alert(error instanceof Error ? error.message : 'Failed to delete project')
        }
    }

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Just now'
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
        return `${Math.floor(diff / 86400000)} days ago`
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Personal Projects"
                description={`Personal projects for ${displayName}`}
            />

            <main className="flex-1 p-6 space-y-6">
                {/* User Badge */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Personal Workspace</span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            {isLoading ? 'Loading...' : `${projects?.length || 0} projects total`}
                        </p>
                    </div>

                    {/* Create Project Button - conditionally locked */}
                    {canCreate ? (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Create Personal Project</DialogTitle>
                                    <DialogDescription>
                                        Create a new personal project. This will be private to your account.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Project Name</Label>
                                        <Input
                                            id="name"
                                            placeholder="My Awesome Project"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description (optional)</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="What is this project about?"
                                            value={projectDescription}
                                            onChange={(e) => setProjectDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                        disabled={isCreating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateProject}
                                        disabled={!projectName.trim() || isCreating}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Project'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="secondary" className="cursor-not-allowed opacity-70">
                                    <Lock className="mr-2 h-4 w-4" />
                                    New Project
                                    <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                        Upgrade
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                side="bottom"
                                align="end"
                                className="w-72 p-4 bg-background/95 backdrop-blur-sm border border-border shadow-xl"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-amber-500/10">
                                            <Lock className="size-4 text-amber-500" />
                                        </div>
                                        <h4 className="font-semibold text-sm">Feature Locked</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {canCreateResult?.reason || "Upgrade your plan to create projects."}
                                    </p>
                                    <Link
                                        href="/dashboard/subscription"
                                        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 rounded-lg hover:opacity-90 transition-opacity"
                                    >
                                        View Upgrade Options
                                    </Link>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>

                {/* Projects Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {/* Existing Projects */}
                        {projects && projects.map((project) => (
                            <Card key={project._id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                                <CardHeader className="flex flex-row items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Folder className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{project.name}</CardTitle>
                                            <CardDescription>{formatDate(project._creationTime)}</CardDescription>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDeleteProject(project._id)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {project.description ? (
                                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                                            Active
                                        </span>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Create New Project Card - always visible but conditionally functional */}
                        {canCreate ? (
                            <Card
                                className="border-dashed hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center min-h-[140px]"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <div className="text-center text-muted-foreground">
                                    <Plus className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-sm font-medium">Create New Project</p>
                                </div>
                            </Card>
                        ) : (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Card className="border-dashed border-muted-foreground/30 transition-colors cursor-not-allowed flex items-center justify-center min-h-[140px] opacity-60">
                                        <div className="text-center text-muted-foreground">
                                            <Lock className="h-8 w-8 mx-auto mb-2" />
                                            <p className="text-sm font-medium">Create New Project</p>
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                Upgrade Required
                                            </span>
                                        </div>
                                    </Card>
                                </PopoverTrigger>
                                <PopoverContent
                                    side="top"
                                    align="center"
                                    className="w-72 p-4 bg-background/95 backdrop-blur-sm border border-border shadow-xl"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-amber-500/10">
                                                <Lock className="size-4 text-amber-500" />
                                            </div>
                                            <h4 className="font-semibold text-sm">Feature Locked</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {canCreateResult?.reason || "Upgrade your plan to create projects."}
                                        </p>
                                        <Link
                                            href="/dashboard/subscription"
                                            className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 rounded-lg hover:opacity-90 transition-opacity"
                                        >
                                            View Upgrade Options
                                        </Link>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                )}

                {/* Empty state info when no projects */}
                {!isLoading && projects && projects.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">
                            {canCreate
                                ? "Click the card above to create your first personal project!"
                                : "Upgrade your plan to start creating projects."}
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
