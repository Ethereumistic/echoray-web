"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2 } from 'lucide-react'

/**
 * Dashboard projects page - redirects to personal projects
 * Route: /dashboard/projects -> /p/[username]/projects
 */
export default function ProjectsRedirectPage() {
    const router = useRouter()
    const { profile } = useAuthStore()

    useEffect(() => {
        if (profile) {
            const userSlug = profile.displayName?.toLowerCase().replace(/\s+/g, '-') ||
                profile.email?.split('@')[0] ||
                'me'
            router.replace(`/p/${userSlug}/projects`)
        }
    }, [profile, router])

    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}
