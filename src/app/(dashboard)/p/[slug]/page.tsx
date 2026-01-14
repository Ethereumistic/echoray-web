"use client"

import { useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'
import { User, FolderOpen, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

/**
 * Personal workspace landing page
 * Route: /p/[username]
 */
export default function PersonalWorkspacePage() {
    const params = useParams()
    const username = params.slug as string
    const { profile } = useAuthStore()

    const displayName = profile?.displayName || username

    const quickLinks = [
        {
            title: 'Projects',
            description: 'View and manage your personal projects',
            icon: FolderOpen,
            href: `/p/${username}/projects`,
        },
        {
            title: 'Documents',
            description: 'Access your personal documents',
            icon: FileText,
            href: `/p/${username}/documents`,
        },
        {
            title: 'Settings',
            description: 'Manage your personal settings',
            icon: Settings,
            href: '/dashboard/settings',
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
                <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
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
