"use client"

import { useParams, notFound } from 'next/navigation'
import { useMemo } from 'react'
import { ScopeContext, ScopeContextValue } from '@/contexts/scope-context'

/**
 * Unified layout for [scope]/[slug] routes.
 * Validates scope param and provides context for child pages.
 */
export default function ScopeSlugLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const scope = params.scope as string
    const slug = params.slug as string

    // Validate scope - must be 'p' (personal) or 'o' (organization)
    if (scope !== 'p' && scope !== 'o') {
        notFound()
    }

    const contextValue = useMemo<ScopeContextValue>(() => ({
        scope: scope as 'p' | 'o',
        slug,
        isPersonal: scope === 'p',
        isOrganization: scope === 'o',
    }), [scope, slug])

    return (
        <ScopeContext.Provider value={contextValue}>
            {children}
        </ScopeContext.Provider>
    )
}
