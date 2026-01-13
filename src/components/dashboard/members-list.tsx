"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"
import { usePermissions } from "@/hooks/use-permissions"
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
import { MoreHorizontal, UserPlus, Shield, UserMinus, ShieldAlert } from "lucide-react"
import { toast } from "sonner"
import { PermissionGuard } from "./permission-guard"
import { InviteMemberDialog } from "./invite-member-dialog"
import { MemberRolesDialog } from "./member-roles-dialog"

/**
 * MembersList component shows a table of all members in the current active org.
 * It includes role badges and management actions.
 */
export function MembersList() {
    const supabase = createClient()
    const { activeOrganization } = useAuthStore()
    const { can } = usePermissions()
    const [members, setMembers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchMembers = async () => {
        if (!activeOrganization) return

        setIsLoading(true)
        try {
            // Fetch members with profiles and roles
            const { data, error } = await supabase
                .from('organization_members')
                .select(`
                    *,
                    profile:profiles(
                        id,
                        full_name,
                        username,
                        avatar_url
                    ),
                    member_roles(
                        role:roles(*)
                    )
                `)
                .eq('organization_id', activeOrganization.id)

            if (error) {
                console.error("Supabase Query Error:", error)
                // If it's a join error, try fetching without profile as fallback so they see SOMETHING
                if (error.message.includes("relationship")) {
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('organization_members')
                        .select(`*, member_roles(role:roles(*))`)
                        .eq('organization_id', activeOrganization.id)

                    if (fallbackError) throw fallbackError
                    setMembers(fallbackData || [])
                    toast.warning("Members loaded without profiles due to schema sync lag.")
                    return
                }
                throw error
            }
            setMembers(data || [])
        } catch (err: any) {
            console.error("Caught Exception in fetchMembers:", err)
            toast.error(err.message || "Failed to load members")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [activeOrganization?.id])

    const handleRemoveMember = async (userId: string) => {
        if (!activeOrganization) return

        try {
            const { error } = await supabase.rpc('remove_member_from_organization', {
                p_organization_id: activeOrganization.id,
                p_user_id: userId
            })

            if (error) throw error

            toast.success("Member removed")
            fetchMembers()
        } catch (err: any) {
            toast.error(err.message || "Failed to remove member")
        }
    }

    if (!activeOrganization) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Members</h3>
                    <p className="text-sm text-muted-foreground">
                        Manage your team members and their roles.
                    </p>
                </div>
                <PermissionGuard permission="members.invite">
                    <InviteMemberDialog onSuccess={fetchMembers} />
                </PermissionGuard>
            </div>

            <div className="rounded-md border border-border/50 bg-card/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Roles</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading members...
                                </TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.profile?.avatar_url} />
                                            <AvatarFallback>
                                                {member.profile?.full_name?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {member.profile?.full_name || "Unknown User"}
                                            </span>
                                            <span className="text-xs text-muted-foreground lowercase">
                                                {member.profile?.username || "user"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {member.member_roles?.map((mr: any) => (
                                                <Badge
                                                    key={mr.role.id}
                                                    variant="secondary"
                                                    className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold"
                                                    style={mr.role.color ? { borderLeftColor: mr.role.color, borderLeftWidth: '3px' } : {}}
                                                >
                                                    {mr.role.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={member.status === 'active' ? 'outline' : 'secondary'} className="capitalize text-[10px]">
                                            {member.status}
                                        </Badge>
                                    </TableCell>
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
                                                <PermissionGuard permission="roles.manage">
                                                    <MemberRolesDialog
                                                        member={member}
                                                        onSuccess={fetchMembers}
                                                        trigger={
                                                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                                                                <Shield className="h-4 w-4" />
                                                                Change Roles
                                                            </DropdownMenuItem>
                                                        }
                                                    />
                                                    <DropdownMenuItem className="gap-2">
                                                        <ShieldAlert className="h-4 w-4" />
                                                        Add Override
                                                    </DropdownMenuItem>
                                                </PermissionGuard>
                                                <PermissionGuard permission="members.remove">
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="gap-2 text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                                        onClick={() => handleRemoveMember(member.user_id)}
                                                    >
                                                        <UserMinus className="h-4 w-4" />
                                                        Remove from Team
                                                    </DropdownMenuItem>
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
