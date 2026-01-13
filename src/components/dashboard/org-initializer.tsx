"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"
import { getMemberPermissions } from "@/lib/supabase/permissions"

/**
 * OrgInitializer is a hidden component that manages organization and permission state.
 * It ensures the auth store is populated with the user's organizations and active org permissions.
 */
export function OrgInitializer() {
    const supabase = createClient()
    const {
        user,
        setOrganizations,
        activeOrganization,
        setActiveOrganization,
        setPermissions,
        setLoading
    } = useAuthStore()

    useEffect(() => {
        if (!user) return

        const initOrgs = async () => {
            setLoading(true)
            try {
                // 1. Fetch organizations where user is a member
                const { data: members, error } = await supabase
                    .from('organization_members')
                    .select('*, organizations(*)')
                    .eq('user_id', user.id)
                    .eq('status', 'active')

                if (error) throw error

                const orgs = (members?.map(m => m.organizations) || []) as any[]
                setOrganizations(orgs)

                // 2. Determine active organization
                let currentOrg = activeOrganization

                // If no active org or the saved one is no longer in the list, pick the first one
                if (!currentOrg || !orgs.find(o => o.id === currentOrg?.id)) {
                    currentOrg = orgs.length > 0 ? orgs[0] : null
                    setActiveOrganization(currentOrg)
                }

                // 3. Fetch permissions for the active organization
                if (currentOrg) {
                    const perms = await getMemberPermissions(supabase, currentOrg.id)
                    setPermissions(perms)
                } else {
                    setPermissions({})
                }

            } catch (err) {
                console.error("Failed to initialize organizations:", err)
            } finally {
                setLoading(false)
            }
        }

        initOrgs()
    }, [user?.id]) // Re-run if user changes

    // Watch for active organization changes to refresh permissions
    useEffect(() => {
        if (!user || !activeOrganization) return

        const refreshPermissions = async () => {
            const perms = await getMemberPermissions(supabase, activeOrganization.id)
            setPermissions(perms)
        }

        refreshPermissions()
    }, [activeOrganization?.id])

    return null // Hidden component
}
