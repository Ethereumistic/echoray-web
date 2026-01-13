"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"
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

interface InviteMemberDialogProps {
    onSuccess?: () => void
}

/**
 * InviteMemberDialog allows triggering an invitation RPC for a specific email and role.
 */
export function InviteMemberDialog({ onSuccess }: InviteMemberDialogProps) {
    const supabase = createClient()
    const { activeOrganization } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [roles, setRoles] = useState<any[]>([])

    const [email, setEmail] = useState("")
    const [selectedRoleId, setSelectedRoleId] = useState<string>("")

    useEffect(() => {
        if (isOpen && activeOrganization) {
            const fetchRoles = async () => {
                const { data, error } = await supabase
                    .from('roles')
                    .select('*')
                    .eq('organization_id', activeOrganization.id)
                    .eq('is_assignable', true)
                    .order('position', { ascending: true })

                if (!error && data) {
                    setRoles(data)
                    // Set default role if available
                    const defaultRole = data.find(r => r.is_default)
                    if (defaultRole) setSelectedRoleId(defaultRole.id)
                }
            }
            fetchRoles()
        }
    }, [isOpen, activeOrganization?.id])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrganization || !email || !selectedRoleId) return

        setIsLoading(true)
        try {
            const { error } = await supabase.rpc('invite_member_to_organization', {
                p_organization_id: activeOrganization.id,
                p_user_email: email,
                p_role_ids: [selectedRoleId]
            })

            if (error) throw error

            toast.success(`Invitation sent to ${email}`)
            setIsOpen(false)
            setEmail("")
            onSuccess?.()
        } catch (err: any) {
            console.error("Invitation error:", err)
            toast.error(err.message || "Failed to send invitation")
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
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Initial Role</Label>
                            <Select
                                value={selectedRoleId}
                                onValueChange={setSelectedRoleId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id}>
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
