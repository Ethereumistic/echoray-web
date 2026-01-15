"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useAuthStore } from "@/stores/auth-store"
import { DashboardHeader } from "@/components/dashboard/header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OrgSettingsForm } from "@/components/dashboard/org-settings-form"
import { MembersList } from "@/components/dashboard/members-list"
import { RolesList } from "@/components/dashboard/roles-list"
import { Settings, Users, Shield, Loader2, User } from "lucide-react"
import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { useScopeContext } from "@/contexts/scope-context"

/**
 * Unified Settings page for both personal (p) and organization (o) scopes.
 * Route: /p/[userId]/settings or /o/[orgId]/settings
 * 
 * - Personal: Redirects to /dashboard/settings
 * - Organization: Shows org-specific settings tabs
 */
export default function SettingsPage() {
    const { scope, slug, isPersonal, isOrganization } = useScopeContext()
    const searchParams = useSearchParams()
    const router = useRouter()
    const {
        organizations,
        activeOrganization,
        setActiveOrganization,
        isLoading: isAuthLoading
    } = useAuthStore()

    const currentTab = searchParams.get('tab') || 'general'
    const [isSwitching, setIsSwitching] = useState(false)

    // Personal settings redirect to dashboard settings
    if (isPersonal) {
        redirect('/dashboard/settings')
    }

    useEffect(() => {
        if (!slug || isAuthLoading || isPersonal) return

        // Ensure we are working with the correct organization context
        if (activeOrganization?._id !== slug) {
            const targetOrg = organizations.find(o => o._id === slug)
            if (targetOrg) {
                setIsSwitching(true)
                setActiveOrganization(targetOrg)
                setTimeout(() => setIsSwitching(false), 100)
            }
        }
    }, [slug, organizations, activeOrganization, isAuthLoading, isPersonal, setActiveOrganization])

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', value)
        router.push(`/${scope}/${slug}/settings?${params.toString()}`)
    }

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
                <p className="text-muted-foreground">You might not have access to this workspace settings.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title={`${activeOrganization.name} Settings`}
                description="Manage your workspace identity, team, and security roles."
            />

            <main className="flex-1 p-6">
                <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-6">
                    <TabsList className="bg-muted/50 border border-border/50 p-1">
                        <TabsTrigger value="general" className="gap-2 px-6">
                            <Settings className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="members" className="gap-2 px-6">
                            <Users className="h-4 w-4" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="roles" className="gap-2 px-6">
                            <Shield className="h-4 w-4" />
                            Roles
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm ring-1 ring-border/20">
                            <CardHeader>
                                <CardTitle>Workspace Identity</CardTitle>
                                <CardDescription>
                                    Update your organization&apos;s public profile and branding.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <OrgSettingsForm />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="members" className="space-y-4">
                        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm ring-1 ring-border/20">
                            <CardHeader>
                                <CardTitle>Team Collaboration</CardTitle>
                                <CardDescription>
                                    Invite and manage the users who have access to this workspace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 border-t border-border/10">
                                <MembersList organizationId={slug} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="roles">
                        <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-sm ring-1 ring-border/20">
                            <CardHeader>
                                <CardTitle>Role Hierarchy</CardTitle>
                                <CardDescription>
                                    Configure bitwise permissions and hierarchical roles for your team.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RolesList organizationId={slug} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
