import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Id } from '../../convex/_generated/dataModel'

/**
 * User roles for role-based access control in the dashboard.
 * DEPRECATED: Moving to bitwise permission system.
 */
export type UserRole = 'user' | 'admin' | 'client' | 'team_member'

/**
 * Organization type matching Convex schema
 */
export interface Organization {
    _id: Id<"organizations">
    name: string
    slug: string
    description?: string
    logoUrl?: string
    ownerId: Id<"users">
    subscriptionTierId: Id<"subscriptionTiers">
    subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'paused'
    subscriptionStartedAt: number
    subscriptionEndsAt?: number
    customPermissions: number
    customConfig?: unknown
    metadata?: unknown
}

/**
 * User profile with extended information.
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
 * Role type matching Convex schema
 */
export interface Role {
    _id: Id<"roles">
    organizationId: Id<"organizations">
    name: string
    description?: string
    color?: string
    permissions: number
    position: number
    isSystemRole: boolean
    systemRoleType?: 'owner' | 'admin' | 'moderator' | 'member'
    isAssignable: boolean
    isDefault: boolean
}

/**
 * Organization member type
 */
export interface OrganizationMember {
    _id: Id<"organizationMembers">
    organizationId: Id<"organizations">
    userId: Id<"users">
    status: 'invited' | 'active' | 'suspended' | 'left'
    invitedBy?: Id<"users">
    invitedAt: number
    joinedAt?: number
    computedPermissions: number
    permissionsLastComputedAt?: number
    metadata?: unknown
}

/**
 * Auth store state interface.
 */
interface AuthState {
    // State
    userId: string | null
    profile: UserProfile | null
    organizations: Organization[]
    activeOrganization: Organization | null
    memberProfile: (OrganizationMember & { roles: Role[] }) | null
    permissions: Record<string, boolean>
    isLoading: boolean
    isAuthenticated: boolean

    // Actions
    setUserId: (userId: string | null) => void
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
            userId: null,
            profile: null,
            organizations: [],
            activeOrganization: null,
            memberProfile: null,
            permissions: {},
            isLoading: true,
            isAuthenticated: false,

            // Actions
            setUserId: (userId) =>
                set({
                    userId,
                    isAuthenticated: !!userId,
                    isLoading: false
                }),

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
                    userId: null,
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
            // Persist profile and active org settings for faster initial renders
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
 * Helper to create a profile from Convex user data
 */
export function createProfileFromConvexUser(user: {
    id: string
    email?: string
    fullName?: string
    avatarUrl?: string
}): UserProfile {
    return {
        id: user.id,
        email: user.email,
        role: 'user', // Default role, actual permissions come from the org
        displayName: user.fullName || user.email?.split('@')[0],
        avatarUrl: user.avatarUrl,
    }
}
