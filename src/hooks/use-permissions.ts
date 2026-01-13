"use client"

import { useAuthStore } from "@/stores/auth-store"
import { PermissionCode } from "@/types/permissions"

/**
 * usePermissions hook for client-side permission checks.
 * Leverages the cached permissions in the auth store.
 */
export function usePermissions() {
    const { permissions, activeOrganization, isLoading } = useAuthStore()

    const can = (permission: PermissionCode): boolean => {
        return permissions[permission] === true
    }

    const canAny = (...permissionCodes: PermissionCode[]): boolean => {
        return permissionCodes.some(code => can(code))
    }

    const canAll = (...permissionCodes: PermissionCode[]): boolean => {
        return permissionCodes.every(code => can(code))
    }

    return {
        can,
        canAny,
        canAll,
        activeOrganization,
        isLoading,
        permissions
    }
}
