'use client'

import { useEffect } from 'react'
import { useConvexAuth, useQuery } from 'convex/react'
import { useAuthStore, createProfileFromConvexUser } from '@/stores/auth-store'
import { api } from '../../../convex/_generated/api'

interface AuthProviderProps {
    children: React.ReactNode
}

/**
 * AuthProvider component that syncs Convex auth state with Zustand store.
 * This ensures the UI updates reactively when auth state changes.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth()
    const { setUserId, setProfile, setLoading, signOut } = useAuthStore()

    // Query current user when authenticated
    const currentUser = useQuery(
        api.users.currentUser,
        isAuthenticated ? {} : "skip"
    )

    // Sync auth state with store
    useEffect(() => {
        if (isAuthLoading) {
            setLoading(true)
            return
        }

        if (!isAuthenticated) {
            signOut()
            return
        }

        // Wait for user data
        if (currentUser === undefined) {
            return
        }

        if (currentUser) {
            setUserId(currentUser._id)
            setProfile(createProfileFromConvexUser({
                id: currentUser._id,
                email: currentUser.email,
                fullName: currentUser.name,
                avatarUrl: currentUser.image,
            }))
        } else {
            signOut()
        }
    }, [isAuthenticated, isAuthLoading, currentUser, setUserId, setProfile, setLoading, signOut])

    return <>{children}</>
}
