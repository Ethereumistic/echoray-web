"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { useQuery } from "convex/react"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Users, FolderOpen, Loader2 } from "lucide-react"
import { OrgQuickActions } from "@/components/dashboard/org-quick-actions"
import { api } from "../../../../../convex/_generated/api"

/**
 * Organization-specific dashboard page.
 * Displays overview stats and activity for the selected organization.
 */
export default function OrganizationDashboardPage() {
    const { slug } = useParams()
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

        // Check if the current active org matches the slug
        if (activeOrganization?.slug !== slug) {
            const targetOrg = organizations.find(o => o.slug === slug)

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
                description={`Workspace overview for ${activeOrganization.slug}`}
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
