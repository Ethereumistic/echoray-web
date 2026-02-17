"use client"

import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@echoray/ui/components/ui/card'
import { Badge } from '@echoray/ui/components/ui/badge'
import { useScopeContext } from '@/contexts/scope-context'
import {
    CloudUpload,
    MessageSquare,
    BarChart3,
    Calendar,
    Users2,
    FileText,
    Share2,
    QrCode,
    Zap,
    ArrowUpRight,
    Lock,
    Database,
    type LucideIcon
} from 'lucide-react'
import Link from 'next/link'
import { cn } from "@echoray/ui/lib/utils"
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'

interface AppDefinition {
    id: string
    title: string
    description: string
    icon: LucideIcon
    category: 'Automation' | 'Marketing' | 'Productivity' | 'CRM' | 'Utilities' | 'Communication'
    href: string
    isNew?: boolean
    isLocked?: boolean
}

export default function AppsPage() {
    const { scope, slug, isPersonal } = useScopeContext()
    const { profile, activeOrganization } = useAuthStore()

    const tier = isPersonal
        ? profile?.subscriptionTier?.name || 'Free'
        : activeOrganization?.subscriptionTier?.name || 'Free'

    const apps: AppDefinition[] = [
        {
            id: 'upload',
            title: 'File Upload',
            description: 'Upload files to your GitHub CDN repository and get instant links.',
            icon: CloudUpload,
            category: 'Utilities',
            href: `/${scope}/${slug}/upload`,
        },
        {
            id: 'notes',
            title: 'Notes',
            description: 'Simple and fast markdown notes for your workspace.',
            icon: FileText,
            category: 'Productivity',
            href: `/${scope}/${slug}/notes`,
        },
        {
            id: 'mapper',
            title: 'Mapper',
            description: 'Build custom databases with 42 field types for any use case.',
            icon: Database,
            category: 'Productivity',
            href: `/${scope}/${slug}/mapper`,
            isNew: true
        },
        {
            id: 'crm',
            title: 'CRM',
            description: 'Manage your leads, contacts, and deals in one place.',
            icon: Users2,
            category: 'CRM',
            href: `/${scope}/${slug}/crm`,
        },
        {
            id: 'analytics',
            title: 'Analytics',
            description: 'Deep insights into your workspace performance and usage.',
            icon: BarChart3,
            category: 'Marketing',
            href: `/${scope}/${slug}/analytics`,
            isLocked: tier === 'Free'
        },
        {
            id: 'chat',
            title: 'Team Chat',
            description: 'Real-time communication for your entire team.',
            icon: MessageSquare,
            category: 'Communication',
            href: `/${scope}/${slug}/chat`,
            isLocked: !isPersonal && tier === 'Free'
        },
        {
            id: 'calendar',
            title: 'Calendar',
            description: 'Schedule meetings and manage your time effectively.',
            icon: Calendar,
            category: 'Productivity',
            href: `/${scope}/${slug}/calendar`,
            isLocked: isPersonal && tier === 'Free'
        },
        {
            id: 'cross-post',
            title: 'Cross Post',
            description: 'Post your content across multiple platforms with one click.',
            icon: Share2,
            category: 'Marketing',
            href: `/${scope}/${slug}/cross-post`,
            isNew: true
        },
        {
            id: 'qr-gen',
            title: 'QR Generator',
            description: 'Generate branded QR codes for your links and products.',
            icon: QrCode,
            category: 'Utilities',
            href: `/${scope}/${slug}/qr-gen`,
        },
        {
            id: 'workflows',
            title: 'Workflows',
            description: 'Automate repetitive tasks with our drag-and-drop builder.',
            icon: Zap,
            category: 'Automation',
            href: `/${scope}/${slug}/workflows`,
            isLocked: true
        }
    ]

    const categories = Array.from(new Set(apps.map(app => app.category)))

    return (
        <div className="flex flex-col min-h-screen bg-background/50">
            <DashboardHeader
                title="Apps & Tools"
                description="Discover and manage powerful applications for your workspace."
            />

            <main className="flex-1 p-6 space-y-12">
                {categories.map((category) => (
                    <section key={category} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold tracking-tight text-foreground/90">{category}</h2>
                            <div className="h-px flex-1 bg-linear-to-r from-border/50 to-transparent" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {apps
                                .filter(app => app.category === category)
                                .map((app, index) => (
                                    <AppCard key={app.id} app={app} index={index} />
                                ))
                            }
                        </div>
                    </section>
                ))}
            </main>
        </div>
    )
}

function AppCard({ app, index }: { app: AppDefinition; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link
                href={app.isLocked ? '#' : app.href}
                className={cn(
                    "group block h-full",
                    app.isLocked && "cursor-not-allowed"
                )}
            >
                <Card className={cn(
                    "h-full relative overflow-hidden transition-all duration-300 border-border/50 bg-card hover:bg-accent/50 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5",
                    app.isLocked && "opacity-80 grayscale-[0.5]"
                )}>
                    {/* Background Glow */}
                    <div className="absolute -right-12 -top-12 size-36 bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />

                    <CardHeader className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn(
                                "flex size-14 items-center justify-center rounded-2xl border transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
                                app.isLocked
                                    ? "bg-muted/50 border-border"
                                    : "bg-primary/5 border-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                            )}>
                                <app.icon className="size-7" />
                            </div>
                            <div className="flex gap-2">
                                {app.isNew && (
                                    <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0">
                                        New
                                    </Badge>
                                )}
                                {app.isLocked && (
                                    <Lock className="size-4 text-muted-foreground/50" />
                                )}
                            </div>
                        </div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {app.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                            {app.description}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 pt-0 relative">
                        {!app.isLocked ? (
                            <div className="flex items-center text-xs font-bold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                                Open App
                                <ArrowUpRight className="ml-1 size-3" />
                            </div>
                        ) : (
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                                Upgrade to Access
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    )
}
