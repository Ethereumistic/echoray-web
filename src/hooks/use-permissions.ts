import { useAuthStore } from "@/stores/auth-store"
import { PermissionCode } from "@/types/permissions"

/**
 * Custom hook for checking user permissions in the current organization.
 * Works with the Zustand auth store which is populated by OrgInitializer.
 */
export function usePermissions() {
    const { permissions, activeOrganization, isLoading, isAuthenticated } = useAuthStore()

    /**
     * Check if the user has a specific permission
     */
    const can = (permission: PermissionCode): boolean => {
        return permissions[permission] === true
    }

    /**
     * Check if the user has any of the specified permissions
     */
    const canAny = (...permissionList: PermissionCode[]): boolean => {
        return permissionList.some(p => permissions[p] === true)
    }

    /**
     * Check if the user has all of the specified permissions
     */
    const canAll = (...permissionList: PermissionCode[]): boolean => {
        return permissionList.every(p => permissions[p] === true)
    }

    return {
        can,
        canAny,
        canAll,
        permissions,
        isLoading,
        isAuthenticated,
        hasActiveOrg: !!activeOrganization,
    }
}
