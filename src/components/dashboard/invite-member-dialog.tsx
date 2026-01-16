"use client"

import { useState, useEffect } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { inviteMemberSchema, type InviteMemberFormValues } from "@/lib/validations"

interface InviteMemberDialogProps {
    onSuccess?: () => void
}

/**
 * InviteMemberDialog allows triggering an invitation RPC for a specific email and role.
 */
export function InviteMemberDialog({ onSuccess }: InviteMemberDialogProps) {
    const { activeOrganization } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const rolesQuery = useQuery(
        api.roles.listRoles,
        isOpen && activeOrganization?._id ? { organizationId: activeOrganization._id } : "skip"
    )

    // Filter assignable roles based on permissions
    const { hasPermission } = useAuthStore()
    const canManageRoles = hasPermission('o.role.manage')
    const canInviteAdmin = hasPermission('o.admin.invite')
    const canInviteEditor = hasPermission('o.editor.invite')
    const canInviteMember = hasPermission('o.member.invite')

    const roles = (rolesQuery || []).filter(r => {
        if (!r.isAssignable) return false

        // Root/Admin check: If they can manage roles, they usually see everything
        if (canManageRoles) return true

        // Otherwise, check specific invite permissions
        if (r.systemRoleType === 'admin') return canInviteAdmin
        if (r.systemRoleType === 'moderator') return canInviteEditor
        if (r.systemRoleType === 'member') return canInviteMember

        // Custom roles: default to member invite permission
        return canInviteMember
    })

    const inviteMemberMutation = useMutation(api.members.inviteMember)

    const [email, setEmail] = useState("")
    const [selectedRoleId, setSelectedRoleId] = useState<string>("")
    const [errors, setErrors] = useState<Partial<Record<keyof InviteMemberFormValues, string>>>({})

    useEffect(() => {
        if (roles.length > 0 && !selectedRoleId) {
            const defaultRole = roles.find(r => r.isDefault)
            if (defaultRole) setSelectedRoleId(defaultRole._id)
            else setSelectedRoleId(roles[0]._id)
        }
    }, [roles, selectedRoleId])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrganization) return

        setErrors({})
        const validation = inviteMemberSchema.safeParse({ email, roleIds: [selectedRoleId] })

        if (!validation.success) {
            const fieldErrors: Partial<Record<keyof InviteMemberFormValues, string>> = {}
            validation.error.issues.forEach(issue => {
                const path = issue.path[0] as keyof InviteMemberFormValues
                fieldErrors[path] = issue.message
            })
            setErrors(fieldErrors)
            return
        }

        setIsLoading(true)
        try {
            await inviteMemberMutation({
                organizationId: activeOrganization._id as Id<"organizations">,
                email,
                roleIds: [selectedRoleId as Id<"roles">]
            })

            toast.success(`Invitation sent to ${email}`)
            setIsOpen(false)
            setEmail("")
            onSuccess?.()
        } catch (err) {
            console.error("Invitation error:", err)
            const message = err instanceof Error ? err.message : "Failed to send invitation"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleInvite}>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation to join your organization. They must already have an Echoray account.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="colleague@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (errors.email) setErrors(prev => ({ ...prev, email: undefined }))
                                }}
                                required
                                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Initial Role</Label>
                            <Select
                                value={selectedRoleId}
                                onValueChange={(val) => {
                                    setSelectedRoleId(val)
                                    if (errors.roleIds) setErrors(prev => ({ ...prev, roleIds: undefined }))
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role._id} value={role._id}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="size-2 rounded-full"
                                                    style={{ backgroundColor: role.color || '#95a5a6' }}
                                                />
                                                {role.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.roleIds && <p className="text-xs text-destructive">{errors.roleIds}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !email || !selectedRoleId}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Inviting...
                                </>
                            ) : (
                                "Send Invitation"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
