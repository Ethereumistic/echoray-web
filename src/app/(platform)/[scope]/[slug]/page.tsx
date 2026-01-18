"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/stores/auth-store"
import { useQuery } from "convex/react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, FolderOpen, Loader2, User, FileText, Settings } from "lucide-react"
import { OrgQuickActions } from "@/components/dashboard/org-quick-actions"
import Link from "next/link"
import { api } from "../../../../../convex/_generated/api"
import { useScopeContext } from "@/contexts/scope-context"

/**
 * Unified workspace page for both personal (p) and organization (o) scopes.
 * Route: /p/[userId] or /o/[orgId]
 */
export default function WorkspacePage() {
    const { slug, isPersonal } = useScopeContext()

    if (isPersonal) {
        return <PersonalWorkspaceContent slug={slug} />
    }

    return <OrganizationWorkspaceContent slug={slug} />
}

// ============================================================================
// Personal Workspace Content
// ============================================================================

function PersonalWorkspaceContent({ slug }: { slug: string }) {
    const { profile } = useAuthStore()
    const displayName = profile?.displayName || 'Personal'

    const quickLinks = [
        {
            title: 'Projects',
            description: 'View and manage your personal projects',
            icon: FolderOpen,
            href: `/p/${slug}/projects`,
        },
        {
            title: 'Documents',
            description: 'Access your personal documents',
            icon: FileText,
            href: `/p/${slug}/documents`,
        },
        {
            title: 'Settings',
            description: 'Manage your personal settings',
            icon: Settings,
            href: '/p/settings',
        },
    ]

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Personal Workspace"
                description={`Welcome back, ${displayName}`}
            />

            <main className="flex-1 p-6 space-y-6">
                {/* User Info Card */}
                <Card className="bg-linear-to-r from-primary/10 to-primary/5 border-primary/20">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">{displayName}</CardTitle>
                                <CardDescription className="text-base">
                                    {profile?.email || 'Personal Workspace'}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Your personal workspace for private projects and documents.
                        </p>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <div className="grid gap-4 md:grid-cols-3">
                    {quickLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <link.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{link.title}</CardTitle>
                                            <CardDescription>{link.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    )
}

// ============================================================================
// Organization Workspace Content
// ============================================================================

function OrganizationWorkspaceContent({ slug }: { slug: string }) {
    const {
        organizations,
        activeOrganization,
        setActiveOrganization,
        isLoading: isAuthLoading
    } = useAuthStore()
    const [isSwitching, setIsSwitching] = useState(false)

    // Query member count
    const members = useQuery(
        api.members.listMembers,
        activeOrganization?._id ? { organizationId: activeOrganization._id } : "skip"
    )

    useEffect(() => {
        if (!slug || isAuthLoading) return

        // Check if the current active org matches the ID in URL
        if (activeOrganization?._id !== slug) {
            const targetOrg = organizations.find(o => o._id === slug)

            if (targetOrg) {
                setIsSwitching(true)
                setActiveOrganization(targetOrg)
                // Small delay to allow store to propagate before showing content
                setTimeout(() => setIsSwitching(false), 100)
            } else if (organizations.length > 0) {
                console.error("Organization not found or access denied")
            }
        }
    }, [slug, organizations, activeOrganization, isAuthLoading, setActiveOrganization])

    if (isAuthLoading || isSwitching) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!activeOrganization) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">Organization Not Found</h2>
                <p className="text-muted-foreground">You might not have access to this workspace.</p>
            </div>
        )
    }

    const memberCount = members?.length || 0

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title={`${activeOrganization.name} Dashboard`}
                description={`Workspace overview`}
            />

            <main className="flex-1 p-6 space-y-8">
                <section className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Quick Actions
                    </h2>
                    <OrgQuickActions />
                </section>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/20 transition-all hover:bg-card/70">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Projects</CardTitle>
                            <FolderOpen className="h-4 w-4 text-primary/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground">
                                Active projects in this workspace
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/20 transition-all hover:bg-card/70">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-primary/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{memberCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Active collaborators
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm ring-1 ring-border/20 transition-all hover:bg-card/70">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                            <Activity className="h-4 w-4 text-primary/70" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{activeOrganization.subscriptionTier?.name || 'Free'}</div>
                            <p className="text-xs text-muted-foreground">
                                {activeOrganization.subscriptionTier ? 'Active Plan' : 'No subscription'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm overflow-hidden">
                    <div className="h-1 w-full bg-linear-to-r from-primary/50 via-primary/80 to-primary/50" />
                    <CardHeader>
                        <CardTitle>Workspace Insights</CardTitle>
                        <CardDescription>
                            Detailed analytics and growth metrics will appear here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground/60 italic border-t border-border/10 mt-4 bg-muted/5">
                        <div className="flex flex-col items-center gap-2">
                            <div className="size-8 rounded-full border-2 border-dashed border-muted-foreground/40 animate-[spin_5s_linear_infinite]" />
                            Collecting data...
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
