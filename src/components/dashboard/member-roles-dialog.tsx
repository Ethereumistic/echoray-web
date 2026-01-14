"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useAuthStore } from "@/stores/auth-store"
import type { Id } from "../../../convex/_generated/dataModel"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Role, MemberWithRoles } from "@/types/permissions"

interface MemberRolesDialogProps {
    member: MemberWithRoles
    onSuccess?: () => void
    trigger?: React.ReactNode
}

/**
 * MemberRolesDialog allows updating the roles assigned to a member.
 */
export function MemberRolesDialog({ member, onSuccess, trigger }: MemberRolesDialogProps) {
    const { activeOrganization } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const allRoles = useQuery(
        api.roles.listRoles,
        isOpen && activeOrganization?._id ? { organizationId: activeOrganization._id } : "skip"
    )

    const updateMemberRoles = useMutation(api.members.updateMemberRoles)

    // Using local state for selection
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(() =>
        member.roles?.filter((r): r is Role => r !== null).map(r => r._id) || []
    )

    const handleToggleRole = (roleId: string) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        )
    }

    const handleSave = async () => {
        if (!activeOrganization || !member) return

        setIsLoading(true)
        try {
            await updateMemberRoles({
                memberId: member._id as Id<"organizationMembers">,
                roleIds: selectedRoleIds as Id<"roles">[]
            })

            toast.success(`Roles updated for ${member.user?.fullName || 'member'}`)
            setIsOpen(false)
            onSuccess?.()
        } catch (err) {
            console.error("Error saving roles:", err)
            const message = err instanceof Error ? err.message : "Failed to update roles"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const isFetching = allRoles === undefined


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Shield className="h-4 w-4" />
                        Manage Roles
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Roles</DialogTitle>
                    <DialogDescription>
                        Update roles for {member.user?.fullName || 'this member'}. Changes take effect immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isFetching ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {allRoles?.map((role) => (
                                <div key={role._id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card/50">
                                    <Checkbox
                                        id={`role-${role._id}`}
                                        checked={selectedRoleIds.includes(role._id)}
                                        onCheckedChange={() => handleToggleRole(role._id)}
                                    // Disable system roles like owner to prevent accidental removal?
                                    // For now let the RPC handle the security logic.
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`role-${role._id}`}
                                            className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer"
                                        >
                                            <div
                                                className="size-2 rounded-full"
                                                style={{ backgroundColor: role.color || '#95a5a6' }}
                                            />
                                            {role.name}
                                            {role.isSystemRole && (
                                                <Badge variant="outline" className="text-[8px] h-3 px-1">SYSTEM</Badge>
                                            )}
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            {role.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading || isFetching}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

