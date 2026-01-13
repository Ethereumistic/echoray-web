'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Settings,
    Users,
    FolderOpen,
    FileText,
    Bell,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, type UserRole } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * Navigation items for the dashboard sidebar.
 * Can be filtered based on user role.
 */
interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    roles?: UserRole[] // If undefined, visible to all roles
}

const navItems: NavItem[] = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Projects',
        href: '/dashboard/projects',
        icon: FolderOpen,
    },
    {
        title: 'Documents',
        href: '/dashboard/documents',
        icon: FileText,
    },
    {
        title: 'Team',
        href: '/dashboard/team',
        icon: Users,
        roles: ['admin', 'team_member'],
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
]

interface DashboardSidebarProps {
    className?: string
}

export function DashboardSidebar({ className }: DashboardSidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, signOut: clearAuthStore } = useAuthStore()
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        clearAuthStore()
        router.push('/')
    }

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true
        return profile?.role && item.roles.includes(profile.role)
    })

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="flex h-16 items-center border-b border-border px-6">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">Echoray</span>
                    <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">
                        {profile?.role || 'user'}
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-border p-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} />
                                <AvatarFallback>
                                    {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left">
                                <span className="text-sm font-medium">{profile?.displayName}</span>
                                <span className="text-xs text-muted-foreground">{profile?.email}</span>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/dashboard/notifications">
                                <Bell className="mr-2 h-4 w-4" />
                                Notifications
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile menu button */}
            <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 lg:hidden"
                onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
                {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card',
                    'hidden lg:flex',
                    className
                )}
            >
                <SidebarContent />
            </aside>

            {/* Mobile sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card',
                    'lg:hidden transition-transform duration-300',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    )
}
