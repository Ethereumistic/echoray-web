'use client'

import { Search, ChevronRight } from 'lucide-react'
import { Input } from '@echoray/ui/components/ui/input'
import { SidebarTrigger } from '@echoray/ui/components/ui/sidebar'
import { Separator } from '@echoray/ui/components/ui/separator'
import { OrgInviteNotifications } from './org-invite-notifications'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@echoray/ui/components/ui/breadcrumb"
import Link from 'next/link'
import { useScopeContext } from '@/contexts/scope-context'
import { cn } from "@echoray/ui/lib/utils"
import { usePathname } from 'next/navigation'

interface DashboardHeaderProps {
    title?: string
    description?: string
    appName?: string
    appHref?: string
    projectName?: string
    projectIcon?: string
    children?: React.ReactNode // Secondary toolbar
    actions?: React.ReactNode // Right side actions
}

/**
 * Enhanced Dashboard header with automatic breadcrumbs, app titles, and toolbars.
 */
export function DashboardHeader({
    title,
    description,
    appName,
    appHref,
    projectName,
    projectIcon,
    children,
    actions
}: DashboardHeaderProps) {
    const { scope, slug } = useScopeContext()
    const pathname = usePathname()

    const appsHref = `/${scope}/${slug}/apps`
    const isAppsRoot = pathname === appsHref
    const showBreadcrumbs = !!appName

    return (
        <header className={cn(
            "sticky top-0 z-30 flex flex-col border-b border-border bg-card/80 backdrop-blur-sm",
            !children ? "h-16" : "h-auto"
        )}>
            {/* Top Row: Navigation & Actions */}
            <div className="flex h-16 items-center gap-4 px-6 w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />

                {/* Left Side: Breadcrumbs / Title */}
                <div className="flex-1 min-w-0">
                    {showBreadcrumbs ? (
                        <div className="flex flex-col">
                            <Breadcrumb>
                                <BreadcrumbList>
                                    {!isAppsRoot && (
                                        <>
                                            <BreadcrumbItem>
                                                <BreadcrumbLink asChild>
                                                    <Link href={appsHref}>Apps</Link>
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                            <BreadcrumbSeparator />
                                        </>
                                    )}

                                    {/* App Name */}
                                    <BreadcrumbItem>
                                        {projectName ? (
                                            <BreadcrumbLink asChild>
                                                <Link href={appHref || '#'} className="font-medium">
                                                    {appName}
                                                </Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage className="font-bold">
                                                {appName}
                                            </BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>

                                    {/* Project Name (Nested) */}
                                    {projectName && (
                                        <>
                                            <BreadcrumbSeparator />
                                            <BreadcrumbItem>
                                                <BreadcrumbPage className="font-bold flex items-center gap-2 text-foreground">
                                                    {projectIcon && <span className="text-lg">{projectIcon}</span>}
                                                    <span className="truncate max-w-[200px] sm:max-w-[400px]">
                                                        {projectName}
                                                    </span>
                                                </BreadcrumbPage>
                                            </BreadcrumbItem>
                                        </>
                                    )}
                                </BreadcrumbList>
                            </Breadcrumb>
                            {description && !projectName && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase tracking-widest font-bold opacity-70">
                                    {description}
                                </p>
                            )}
                        </div>
                    ) : title ? (
                        <div className="flex flex-col">
                            <h1 className="text-lg font-semibold leading-none truncate">{title}</h1>
                            {description && (
                                <p className="text-[10px] text-muted-foreground mt-0.5 truncate uppercase tracking-widest font-bold opacity-70">
                                    {description}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search..."
                                className="pl-9 bg-muted/50 h-9"
                            />
                        </div>
                    )}
                </div>

                {/* Right Side: Quick Actions & Alerts */}
                <div className="flex items-center gap-3">
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                    <Separator orientation="vertical" className="h-4 hidden sm:block" />
                    <OrgInviteNotifications />
                </div>
            </div>

            {/* Bottom Row: Context-dependent Toolbar (Filters, View Switchers, etc.) */}
            {children && (
                <div className="px-6 py-2 border-t border-border/40 bg-muted/10">
                    {children}
                </div>
            )}
        </header>
    )
}
