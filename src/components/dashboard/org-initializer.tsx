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

        // Detect if active org data is stale or the org is no longer in the list
        const orgs = (organizations || []) as Organization[]
        setOrganizations(orgs)

        const currentInList = activeOrganization ? orgs.find(o => o._id === activeOrganization._id) : null

        if (!activeOrganization || !currentInList) {
            // Pick first org if none active or current no longer exists
            const firstOrg = orgs.length > 0 ? orgs[0] : null
            setActiveOrganization(firstOrg)
        } else if (JSON.stringify(currentInList) !== JSON.stringify(activeOrganization)) {
            // Update active org if data changed (e.g. ownerId transferred)
            setActiveOrganization(currentInList)
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
