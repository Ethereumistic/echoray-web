"use client"

import { useEffect } from "react"
import { useQuery } from "convex/react"
import { useAuthStore, createProfileFromConvexUser } from "@/stores/auth-store"
import { api } from "../../../convex/_generated/api"
import type { Organization } from "@/stores/auth-store"

/**
 * OrgInitializer is a hidden component that manages organization and permission state.
 * It ensures the auth store is populated with the user's organizations and active org permissions.
 */
export function OrgInitializer() {
    const {
        userId,
        setUserId,
        setProfile,
        setOrganizations,
        activeOrganization,
        setActiveOrganization,
        setPermissions,
        setLoading
    } = useAuthStore()

    // 1. Sync User Data
    const user = useQuery(api.users.currentUser)

    useEffect(() => {
        // user === undefined means still loading from Convex
        // user === null means not authenticated
        // user === object means authenticated
        if (user === undefined) {
            // Still loading, keep isLoading true
            return
        }

        if (user === null) {
            // Not authenticated - clear state and set loading to false
            setUserId(null)
            setLoading(false)
            return
        }

        // User is authenticated
        setUserId(user._id)
        setProfile(createProfileFromConvexUser(user))
    }, [user, setUserId, setProfile, setLoading])

    // Query organizations the user is a member of
    const organizations = useQuery(
        api.organizations.listMyOrganizations,
        userId ? {} : "skip"
    )

    // Query permissions for the active context (global or org-specific)
    const permissions = useQuery(
        api.permissions.getUserPermissions,
        userId ? { organizationId: activeOrganization?._id } : "skip"
    )

    // Update organizations in store when query completes
    useEffect(() => {
        if (organizations === undefined) {
            setLoading(true)
            return
        }

        setLoading(false)
        const orgs = (organizations || []) as Organization[]
        setOrganizations(orgs)

        // If no active org or the saved one is no longer in the list, pick the first one
        // We also check for _id to ensure it's a Convex org (Supabase used 'id')
        const isStale = !!activeOrganization && !activeOrganization._id
        const notInList = !!activeOrganization && !orgs.find(o => o._id === activeOrganization._id)

        if (!activeOrganization || isStale || notInList) {
            const firstOrg = orgs.length > 0 ? orgs[0] : null
            setActiveOrganization(firstOrg)
        }
    }, [organizations, activeOrganization, setActiveOrganization, setLoading, setOrganizations])

    // Update permissions when they change
    useEffect(() => {
        if (permissions !== undefined) {
            setPermissions(permissions)
        }
    }, [permissions, setPermissions])

    return null // Hidden component
}
