'use client'

import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'

interface DashboardHeaderProps {
    title?: string
    description?: string
}

/**
 * Dashboard header with search, notifications, and user info.
 */
export function DashboardHeader({ title, description }: DashboardHeaderProps) {
    const { profile } = useAuthStore()

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-6">
            {/* Left side - Title or Search */}
            <div className="flex-1">
                {title ? (
                    <div>
                        <h1 className="text-lg font-semibold">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground">{description}</p>
                        )}
                    </div>
                ) : (
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search..."
                            className="pl-9 bg-muted/50"
                        />
                    </div>
                )}
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                        3
                    </span>
                </Button>

                {/* Greeting */}
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium">
                        Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                        {profile?.role || 'user'} account
                    </p>
                </div>
            </div>
        </header>
    )
}
