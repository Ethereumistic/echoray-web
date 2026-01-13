'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore, extractProfileFromUser } from '@/stores/auth-store'

interface AuthProviderProps {
    children: React.ReactNode
}

/**
 * AuthProvider component that manages Supabase auth state and syncs with Zustand store.
 * Wrap your app with this provider to enable auth state management.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const { setUser, setSession, setProfile, setLoading, signOut } = useAuthStore()

    const initializeAuth = useCallback(async () => {
        const supabase = createClient()

        try {
            // Get initial session
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Error getting session:', error)
                signOut()
                return
            }

            if (session?.user) {
                setUser(session.user)
                setSession(session)
                setProfile(extractProfileFromUser(session.user))
            } else {
                signOut()
            }
        } catch (err) {
            console.error('Error initializing auth:', err)
            signOut()
        }
    }, [setUser, setSession, setProfile, signOut])

    useEffect(() => {
        const supabase = createClient()

        // Initialize auth state
        initializeAuth()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event)

                if (session?.user) {
                    setUser(session.user)
                    setSession(session)
                    setProfile(extractProfileFromUser(session.user))
                } else {
                    signOut()
                }

                // Handle specific auth events
                switch (event) {
                    case 'SIGNED_IN':
                        // User signed in
                        break
                    case 'SIGNED_OUT':
                        // User signed out
                        break
                    case 'TOKEN_REFRESHED':
                        // Token was refreshed
                        break
                    case 'USER_UPDATED':
                        // User data was updated
                        if (session?.user) {
                            setProfile(extractProfileFromUser(session.user))
                        }
                        break
                }
            }
        )

        // Cleanup subscription on unmount
        return () => {
            subscription.unsubscribe()
        }
    }, [initializeAuth, setUser, setSession, setProfile, signOut, setLoading])

    return <>{children}</>
}
