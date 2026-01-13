"use client"

import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UpdateProfileForm } from '@/components/auth/update-profile-form'
import { SettingsPasswordForm } from '@/components/auth/settings-password-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/stores/auth-store'
import { OrgSettingsForm } from '@/components/dashboard/org-settings-form'
import { MembersList } from '@/components/dashboard/members-list'
import { User, Shield, Building2, Users } from 'lucide-react'

/**
 * Dashboard settings page.
 * Allows users to manage their account settings and active organization.
 */
export default function SettingsPage() {
    const { profile, activeOrganization } = useAuthStore()

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Settings"
                description="Manage your account settings and organization preferences"
            />

            <main className="flex-1 p-6 max-w-5xl">
                <Tabs defaultValue="account" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1 border border-border/50">
                        <TabsTrigger value="account" className="gap-2">
                            <User className="size-4" />
                            Account
                        </TabsTrigger>
                        {activeOrganization && (
                            <TabsTrigger value="organization" className="gap-2">
                                <Building2 className="size-4" />
                                Organization
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="account" className="space-y-6">
                        {/* Profile Section */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="size-5 text-primary" />
                                    Profile
                                </CardTitle>
                                <CardDescription>
                                    Update your personal information and public profile.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UpdateProfileForm initialDisplayName={profile?.displayName || ''} />
                            </CardContent>
                        </Card>

                        {/* Security Section */}
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="size-5 text-primary" />
                                    Security
                                </CardTitle>
                                <CardDescription>
                                    Manage your password and security settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SettingsPasswordForm />
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-destructive/30 bg-destructive/5">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>
                                    Irreversible and destructive actions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                </p>
                                <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 font-medium text-destructive text-sm">
                                    Delete functionality coming soon.
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {activeOrganization && (
                        <TabsContent value="organization" className="space-y-6">
                            <OrgSettingsForm />
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="size-5 text-primary" />
                                        Team Management
                                    </CardTitle>
                                    <CardDescription>
                                        Control who has access to this workspace.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MembersList />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </main>
        </div>
    )
}
