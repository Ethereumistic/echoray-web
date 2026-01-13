import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UpdateProfileForm } from '@/components/auth/update-profile-form'
import { SettingsPasswordForm } from '@/components/auth/settings-password-form'

/**
 * Dashboard settings page.
 * Allows users to manage their account settings.
 */
export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/auth/login')
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Settings"
                description="Manage your account settings and preferences"
            />

            <main className="flex-1 p-6 space-y-6 max-w-4xl">
                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Update your personal information
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UpdateProfileForm initialDisplayName={user.user_metadata?.display_name || ''} />
                    </CardContent>
                </Card>

                {/* Security Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>
                            Manage your password and security settings
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SettingsPasswordForm />
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>
                            Irreversible and destructive actions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        {/* We'll implement the actual delete button later as per auth.mdx */}
                        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                            <span className="text-sm font-medium text-destructive">Delete functionality coming soon.</span>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
