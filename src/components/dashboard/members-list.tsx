"use client"

import { useQuery, useMutation } from "convex/react"
import type { Id } from "../../../convex/_generated/dataModel"
import type { MemberWithRoles } from "@/types/permissions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Shield, UserMinus, ShieldAlert, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import { PermissionGuard } from "./permission-guard"
import { InviteMemberDialog } from "./invite-member-dialog"
import { MemberRolesDialog } from "./member-roles-dialog"
import { api } from "../../../convex/_generated/api"

/**
 * MembersList component shows a table of all members in the current active org.
 * It includes role badges and management actions.
 * @param organizationId - The ID of the organization to display members for
 */
export function MembersList({ organizationId }: { organizationId: string }) {
    const { activeOrganization, profile, hasPermission } = useAuthStore()
    // Query members with Convex
    const members = useQuery(
        api.members.listMembers,
        organizationId ? { organizationId: organizationId as Id<"organizations"> } : "skip"
    )

    const removeMember = useMutation(api.members.removeMember)

    // Check if user has any member management permissions
    const canManageRoles = hasPermission('o.role.manage')
    const canRemoveMembers = hasPermission('o.member.remove')
    const canRemoveAdmins = hasPermission('o.admin.remove')
    const isOwner = activeOrganization?.ownerId === profile?.id

    // Show actions column if user can do anything (owner always can)
    const showActionsColumn = isOwner || canManageRoles || canRemoveMembers || canRemoveAdmins

    const handleRemoveMember = async (userId: string) => {
        if (!organizationId) return

        try {
            await removeMember({
                organizationId: organizationId as Id<"organizations">,
                targetUserId: userId as Id<"users">,
            })
            toast.success("Member removed")
        } catch (err) {
            console.error("Error removing member:", err)
            let message = err instanceof Error ? err.message : "Failed to remove member"

            // Clean up Convex internal error messages
            if (message.includes("Uncaught Error: ")) {
                message = message.split("Uncaught Error: ")[1].split("\n")[0]
            }

            toast.error(message)
        }
    }

    const refetch = () => {
        // Convex queries are reactive, no manual refetch needed
    }

    if (!organizationId) return null

    const isLoading = members === undefined

    return (
        <div className="space-y-4  p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your team members and their roles.
                    </p>
                </div>
                <PermissionGuard permission="o.member.invite">
                    <InviteMemberDialog onSuccess={refetch} />
                </PermissionGuard>
            </div>

            <div className="rounded-md border border-border/50 bg-card/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            {showActionsColumn && (
                                <TableHead className="text-right">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={showActionsColumn ? 4 : 3} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Loading members...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : !members || members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={showActionsColumn ? 4 : 3} className="h-24 text-center">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member: MemberWithRoles) => (
                                <TableRow key={member._id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.user?.avatarUrl} />
                                            <AvatarFallback>
                                                {member.user?.fullName?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {member.user?.fullName || member.user?.username || member.user?.email?.split('@')[0] || "Unknown User"}
                                            </span>
                                            <span className="text-xs text-muted-foreground lowercase">
                                                {member.user?.email || member.user?.username || "user"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {member.memberRoles?.map((mr) => (
                                                mr.role && (
                                                    <Badge
                                                        key={mr.role._id}
                                                        variant="secondary"
                                                        className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold"
                                                        style={mr.role.color ? { borderLeftColor: mr.role.color, borderLeftWidth: '3px' } : {}}
                                                    >
                                                        {mr.role.name}
                                                    </Badge>
                                                )
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'active' ? 'outline' : 'secondary'} className="capitalize text-[10px]">
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    {showActionsColumn && (
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <PermissionGuard permission="o.role.manage">
                                                        {((member.userId !== profile?.id) || activeOrganization?.ownerId === profile?.id) && (
                                                            <>
                                                                {/* Prevent Admins from editing other Admins or Owner */}
                                                                {(activeOrganization?.ownerId === profile?.id ||
                                                                    !member.roles?.some(r => r?.isSystemRole && r?.systemRoleType === 'admin')) && (
                                                                        <MemberRolesDialog
                                                                            member={member}
                                                                            onSuccess={refetch}
                                                                            trigger={
                                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                                                                                    <Shield className="h-4 w-4" />
                                                                                    Change Roles
                                                                                </DropdownMenuItem>
                                                                            }
                                                                        />
                                                                    )}
                                                                <DropdownMenuItem className="gap-2">
                                                                    <ShieldAlert className="h-4 w-4" />
                                                                    Add Override
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </PermissionGuard>
                                                    <PermissionGuard permission="o.member.remove">
                                                        <DropdownMenuSeparator />
                                                        {member.userId === profile?.id ? (
                                                            <DropdownMenuItem
                                                                className="gap-2 opacity-50 cursor-not-allowed text-muted-foreground"
                                                                onClick={() => toast.info("Use the Leave Organization button in settings to leave.")}
                                                            >
                                                                <UserMinus className="h-4 w-4" />
                                                                Remove from Team
                                                            </DropdownMenuItem>
                                                        ) : member.userId === activeOrganization?.ownerId ? (
                                                            <DropdownMenuItem
                                                                className="gap-2 opacity-50 cursor-not-allowed text-muted-foreground"
                                                                onClick={() => toast.info("The owner cannot be removed. Transfer ownership first.")}
                                                            >
                                                                <UserMinus className="h-4 w-4" />
                                                                Remove from Team
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem
                                                                className="gap-2 text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                                                onClick={() => handleRemoveMember(member.userId)}
                                                            >
                                                                <UserMinus className="h-4 w-4" />
                                                                Remove from Team
                                                            </DropdownMenuItem>
                                                        )}
                                                    </PermissionGuard>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
