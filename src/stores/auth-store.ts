import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User, Session } from '@supabase/supabase-js'
import type { Organization, OrganizationMember, Role } from '@/types/permissions'

/**
 * User roles for role-based access control in the dashboard.
 * DEPRECATED: Moving to bitwise permission system.
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
    organizations: Organization[]
    activeOrganization: Organization | null
    memberProfile: (OrganizationMember & { roles: Role[] }) | null
    permissions: Record<string, boolean>
    isLoading: boolean
    isAuthenticated: boolean

    // Actions
    setUser: (user: User | null) => void
    setSession: (session: Session | null) => void
    setProfile: (profile: UserProfile | null) => void
    setOrganizations: (orgs: Organization[]) => void
    setActiveOrganization: (org: Organization | null) => void
    setMemberProfile: (member: (OrganizationMember & { roles: Role[] }) | null) => void
    setPermissions: (permissions: Record<string, boolean>) => void
    setLoading: (isLoading: boolean) => void
    signOut: () => void

    // Computed helpers
    hasPermission: (permission: string) => boolean
}

/**
 * Auth store using Zustand for managing authentication state.
 * This store persists the user profile and active org settings.
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            session: null,
            profile: null,
            organizations: [],
            activeOrganization: null,
            memberProfile: null,
            permissions: {},
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

            setOrganizations: (organizations) =>
                set({ organizations }),

            setActiveOrganization: (activeOrganization) =>
                set({ activeOrganization }),

            setMemberProfile: (memberProfile) =>
                set({ memberProfile }),

            setPermissions: (permissions) =>
                set({ permissions }),

            setLoading: (isLoading) =>
                set({ isLoading }),

            signOut: () =>
                set({
                    user: null,
                    session: null,
                    profile: null,
                    organizations: [],
                    activeOrganization: null,
                    memberProfile: null,
                    permissions: {},
                    isAuthenticated: false,
                    isLoading: false
                }),

            // Computed helpers
            hasPermission: (permission) => {
                const { permissions } = get()
                return permissions[permission] === true
            },
        }),
        {
            name: 'echoray-auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Persist profile and active org for faster initial renders
            partialize: (state) => ({
                profile: state.profile,
                activeOrganization: state.activeOrganization,
                memberProfile: state.memberProfile,
                permissions: state.permissions
            }),
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
