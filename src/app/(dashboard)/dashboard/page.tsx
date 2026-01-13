import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderOpen, FileText, Users, Clock } from 'lucide-react'

/**
 * Dashboard overview page.
 * Shows a summary of the user's activity and quick actions.
 */
export default async function DashboardPage() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getClaims()

    if (error || !data?.claims) {
        redirect('/auth/login')
    }

    const user = data.claims

    // Stats cards data - in a real app, fetch these from your database
    const stats = [
        {
            title: 'Active Projects',
            value: '3',
            description: 'In progress',
            icon: FolderOpen,
            color: 'text-blue-500',
        },
        {
            title: 'Documents',
            value: '12',
            description: 'Shared with you',
            icon: FileText,
            color: 'text-green-500',
        },
        {
            title: 'Team Members',
            value: '5',
            description: 'Active',
            icon: Users,
            color: 'text-purple-500',
        },
        {
            title: 'Hours Logged',
            value: '24',
            description: 'This week',
            icon: Clock,
            color: 'text-orange-500',
        },
    ]

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Dashboard"
                description="Welcome to your Echoray dashboard"
            />

            <main className="flex-1 p-6 space-y-6">
                {/* Welcome Card */}
                <Card className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-2xl">
                            Welcome back, {typeof user.email === 'string' ? user.email.split('@')[0] : 'User'}! 👋
                        </CardTitle>
                        <CardDescription>
                            Here&apos;s what&apos;s happening with your projects today.
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="hover:border-primary/50 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest project updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <FolderOpen className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">Project {i} updated</p>
                                            <p className="text-xs text-muted-foreground">2 hours ago</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks you can perform</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                {[
                                    { label: 'Create New Project', icon: FolderOpen },
                                    { label: 'Upload Document', icon: FileText },
                                    { label: 'Invite Team Member', icon: Users },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left w-full"
                                    >
                                        <action.icon className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
