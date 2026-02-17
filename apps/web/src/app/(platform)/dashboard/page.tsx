"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

/**
 * Dashboard redirect page.
 * Redirects authenticated users to their personal workspace.
 * Route: /dashboard -> /p/[userId]
 */
export default function DashboardRedirectPage() {
    const router = useRouter()
    const { profile, isLoading } = useAuthStore()

    useEffect(() => {
        if (!isLoading && profile?.id) {
            router.replace(`/p/${profile.id}`)
        }
    }, [isLoading, profile, router])

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Redirecting to your workspace...</p>
            </div>
        </div>
    )
}
