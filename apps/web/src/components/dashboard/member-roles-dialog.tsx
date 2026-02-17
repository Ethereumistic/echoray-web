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
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Crown } from "lucide-react"

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
    const [confirmTransfer, setConfirmTransfer] = useState("")
    const [isTransferring, setIsTransferring] = useState(false)
    const { profile, setActiveOrganization } = useAuthStore()
    const transferOwnership = useMutation(api.organizations.transferOwnership)

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

    const handleTransfer = async () => {
        if (!activeOrganization || !member) return
        const expectedConfirm = `transfer to ${member.user?.fullName || 'member'}`
        if (confirmTransfer !== expectedConfirm) {
            toast.error("Confirmation text does not match")
            return
        }

        setIsTransferring(true)
        try {
            await transferOwnership({
                organizationId: activeOrganization._id,
                newOwnerId: member.userId as Id<"users">
            })
            toast.success(`Ownership transferred to ${member.user?.fullName}`)
            setIsOpen(false)
            // Need to update local state since we are no longer owner
            setActiveOrganization({
                ...activeOrganization,
                ownerId: member.userId as Id<"users">
            })
            onSuccess?.()
        } catch (err) {
            console.error("Error transferring ownership:", err)
            const message = err instanceof Error ? err.message : "Failed to transfer ownership"
            toast.error(message)
        } finally {
            setIsTransferring(false)
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

                {activeOrganization?.ownerId === profile?.id && member.userId !== profile?.id && (
                    <div className="pt-4 border-t border-destructive/20 mt-2">
                        <div className="flex items-center gap-2 text-destructive mb-3">
                            <AlertTriangle className="size-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Danger Zone</span>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 gap-2 h-9 text-xs"
                                >
                                    <Crown className="size-4" />
                                    Transfer Ownership to Member
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-destructive/20 max-w-sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <Crown className="size-5 text-amber-500" />
                                        Transfer Ownership?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-xs">
                                        You are about to transfer full control of <span className="font-bold text-foreground">{activeOrganization?.name}</span> to <span className="font-bold text-foreground">{member.user?.fullName || 'this member'}</span>.
                                        You will be demoted to **Admin**.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4 space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/70">
                                        Type <span className="text-foreground select-all font-mono">transfer to {member.user?.fullName}</span> to confirm
                                    </Label>
                                    <Input
                                        placeholder="Confirmation text"
                                        value={confirmTransfer}
                                        onChange={(e) => setConfirmTransfer(e.target.value)}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <AlertDialogFooter className="flex-col sm:flex-col gap-2">
                                    <Button
                                        variant="destructive"
                                        className="w-full h-10 font-bold"
                                        onClick={handleTransfer}
                                        disabled={isTransferring || confirmTransfer !== `transfer to ${member.user?.fullName}`}
                                    >
                                        {isTransferring ? <Loader2 className="animate-spin size-4" /> : "Confirm Ownership Transfer"}
                                    </Button>
                                    <AlertDialogCancel className="w-full h-10 mt-0">Cancel</AlertDialogCancel>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}

                <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-4 mt-6 border-t">
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

