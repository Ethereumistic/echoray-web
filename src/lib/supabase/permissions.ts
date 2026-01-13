import { SupabaseClient } from '@supabase/supabase-js'
import { PermissionCode, PERMISSION_BITS } from '@/types/permissions'

/**
 * Check if the user has a specific permission in an organization using bitwise math.
 * This is meant for CLIENT SIDE usage where we might have the member object with computed_permissions.
 */
export function hasPermissionBit(
    computedPermissions: string | number | bigint,
    permissionCode: PermissionCode
): boolean {
    const bitPosition = PERMISSION_BITS[permissionCode]
    const perms = BigInt(computedPermissions)
    return (perms & (1n << BigInt(bitPosition))) !== 0n
}

/**
 * Server-side / RPC wrapper to check permission in the database.
 * Use this in Server Actions or API routes.
 */
export async function checkPermission(
    supabase: SupabaseClient,
    organizationId: string,
    permissionCode: PermissionCode
): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data, error } = await supabase.rpc('user_has_permission', {
        p_user_id: user.id,
        p_organization_id: organizationId,
        p_permission_code: permissionCode
    })

    if (error) {
        console.error('Error checking permission:', error)
        return false
    }

    return !!data
}

/**
 * Get all permissions for the current user in a specific organization.
 */
export async function getMemberPermissions(
    supabase: SupabaseClient,
    organizationId: string
): Promise<Record<string, boolean>> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return {}

    const { data, error } = await supabase.rpc('get_user_permissions', {
        p_user_id: user.id,
        p_organization_id: organizationId
    })

    if (error) {
        console.error('Error fetching permissions:', error)
        return {}
    }

    return (data as { permission_code: string; has_permission: boolean }[]).reduce(
        (acc, curr) => {
            acc[curr.permission_code] = curr.has_permission
            return acc
        },
        {} as Record<string, boolean>
    )
}
