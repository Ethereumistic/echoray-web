'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface DashboardHeaderProps {
    title?: string
    description?: string
}

/**
 * Dashboard header with search and sidebar trigger.
 */
export function DashboardHeader({ title, description }: DashboardHeaderProps) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            {/* Left side - Title or Search */}
            <div className="flex-1">
                {title ? (
                    <div>
                        <h1 className="text-lg font-semibold leading-none">{title}</h1>
                        {description && (
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
        </header>
    )
}
