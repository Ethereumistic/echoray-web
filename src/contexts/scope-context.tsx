"use client"

import { createContext, useContext } from 'react'

/**
 * Scope context for personal (p) vs organization (o) workspaces.
 * Provides type-safe access to scope-related params throughout the app.
 */
export interface ScopeContextValue {
    scope: 'p' | 'o'
    slug: string
    isPersonal: boolean
    isOrganization: boolean
}

export const ScopeContext = createContext<ScopeContextValue | null>(null)

export function useScopeContext() {
    const context = useContext(ScopeContext)
    if (!context) {
        throw new Error('useScopeContext must be used within a ScopeProvider')
    }
    return context
}
