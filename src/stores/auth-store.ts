import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'

/**
 * User roles for role-based access control in the dashboard.
 * Different user types will see different dashboard views.
 */
export type UserRole = 'user' | 'admin' | 'client' | 'team_member'

/**
 * User profile with extended information beyond Supabase user.
 */
export interface UserProfile {
    id: string
    email: string | undefined
    role: UserRole
    displayName?: string
    avatarUrl?: string
    createdAt?: string
}

/**
 * Auth store state interface.
 */
interface AuthState {
    // State
    user: User | null
    session: Session | null
    profile: UserProfile | null
    isLoading: boolean
    isAuthenticated: boolean

    // Actions
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setProfile: (profile: UserProfile | null) => void
    setLoading: (isLoading: boolean) => void
    signOut: () => void

    // Computed helpers
    hasRole: (role: UserRole) => boolean
    isAdmin: () => boolean
}

/**
 * Auth store using Zustand for managing authentication state.
 * This store persists the user profile to localStorage for faster initial renders.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            session: null,
            profile: null,
            isLoading: true,
            isAuthenticated: false,

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false
                }),

            setSession: (session) =>
                set({ session }),

            setProfile: (profile) =>
                set({ profile }),

            setLoading: (isLoading) =>
                set({ isLoading }),

            signOut: () =>
                set({
                    user: null,
                    session: null,
                    profile: null,
                    isAuthenticated: false,
                    isLoading: false
                }),

            // Computed helpers
            hasRole: (role) => {
                const { profile } = get()
                return profile?.role === role
            },

            isAdmin: () => {
                const { profile } = get()
                return profile?.role === 'admin'
            },
        }),
        {
            name: 'echoray-auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist the profile for faster initial renders
            // User and session should come from Supabase
            partialize: (state) => ({ profile: state.profile }),
        }
    )
)

/**
 * Helper to extract user profile from Supabase user.
 * In a real app, you'd fetch additional profile data from a profiles table.
 */
export function extractProfileFromUser(user: User): UserProfile {
    // Get role from user metadata or default to 'user'
    const role = (user.user_metadata?.role as UserRole) || 'user'

    return {
        id: user.id,
        email: user.email,
        role,
        displayName: user.user_metadata?.display_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: user.created_at,
    }
}
