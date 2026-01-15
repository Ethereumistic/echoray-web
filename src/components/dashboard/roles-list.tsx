"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, Plus, MoreHorizontal, Check, Edit2 } from "lucide-react"
import { toast } from "sonner"
import { PermissionGuard } from "./permission-guard"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * RolesList component allows managing organization-wide roles.
 * @param organizationId - The ID of the organization to display roles for
 */
export function RolesList({ organizationId }: { organizationId: string }) {
    const [actionLoading, setActionLoading] = useState(false)

    const roles = useQuery(
        api.roles.listRoles,
        organizationId ? { organizationId: organizationId as Id<"organizations"> } : "skip"
    )

    const setDefaultRole = useMutation(api.roles.setDefaultRole)

    const handleSetDefault = async (roleId: string) => {
        if (!organizationId) return

        setActionLoading(true)
        try {
            await setDefaultRole({
                organizationId: organizationId as Id<"organizations">,
                roleId: roleId as Id<"roles">
            })

            toast.success("Default role updated")
        } catch (err) {
            console.error("Error updating default role:", err)
            const message = err instanceof Error ? err.message : "Failed to update default role"
            toast.error(message)
        } finally {
            setActionLoading(false)
        }
    }

    const isLoading = roles === undefined


    if (!organizationId) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Roles</h3>
                    <p className="text-sm text-muted-foreground">
                        Define hierarchies and permissions for your team.
                    </p>
                </div>
                <PermissionGuard permission="roles.manage">
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Role
                    </Button>
                </PermissionGuard>
            </div>

            <div className="rounded-md border border-border/50 bg-card/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[200px]">Role Name</TableHead>
                            <TableHead>Color</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Default</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" />
                                </TableCell>
                            </TableRow>
                        ) : roles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No roles configured yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            roles.map((role) => (
                                <TableRow key={role._id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Shield className="h-4 w-4 opacity-50" />
                                            {role.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-4 w-4 rounded-full border border-white/10"
                                                style={{ backgroundColor: role.color || '#95a5a6' }}
                                            />
                                            <span className="text-xs font-mono text-muted-foreground uppercase">
                                                {role.color || '#95a5a6'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {role.isSystemRole ? (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] uppercase font-bold"
                                                style={{
                                                    backgroundColor: `${role.color}10`, // 10% opacity
                                                    color: role.color,
                                                    borderColor: `${role.color}30`
                                                }}
                                            >
                                                SYSTEM ({role.systemRoleType})
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] uppercase font-bold"
                                                style={{
                                                    backgroundColor: `${role.color}10`,
                                                    color: role.color,
                                                    borderColor: `${role.color}30`
                                                }}
                                            >
                                                CUSTOM
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {role.isDefault ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">
                                                <Check className="mr-1 h-3 w-3" />
                                                DEFAULT
                                            </Badge>
                                        ) : (
                                            <PermissionGuard permission="roles.manage">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-[10px] text-muted-foreground hover:text-foreground"
                                                    disabled={actionLoading}
                                                    onClick={() => handleSetDefault(role._id)}
                                                >
                                                    Set Default
                                                </Button>
                                            </PermissionGuard>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Role Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <PermissionGuard permission="roles.manage">
                                                    <DropdownMenuItem className="gap-2">
                                                        <Edit2 className="h-4 w-4" />
                                                        Edit Permissions
                                                    </DropdownMenuItem>
                                                    {!role.isSystemRole && (
                                                        <DropdownMenuItem className="gap-2 text-destructive">
                                                            Delete Role
                                                        </DropdownMenuItem>
                                                    )}
                                                </PermissionGuard>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
