"use client"

import { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { PermissionCode } from "@/types/permissions"

interface PermissionGuardProps {
    permission: PermissionCode | PermissionCode[]
    requireAll?: boolean
    fallback?: ReactNode
    children: ReactNode
}

/**
 * PermissionGuard component to conditionally render children based on user permissions.
 */
export function PermissionGuard({
    permission,
    requireAll = false,
    fallback = null,
    children
}: PermissionGuardProps) {
    const { can, canAll, canAny, isLoading } = usePermissions()

    if (isLoading) {
        return null // Or a small loader
    }

    const permissions = Array.isArray(permission) ? permission : [permission]
    const hasPermission = requireAll
        ? canAll(...permissions)
        : canAny(...permissions)

    if (!hasPermission) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
