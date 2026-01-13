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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface MemberRolesDialogProps {
    member: any
    onSuccess?: () => void
    trigger?: React.ReactNode
}

/**
 * MemberRolesDialog allows updating the roles assigned to a member.
 */
export function MemberRolesDialog({ member, onSuccess, trigger }: MemberRolesDialogProps) {
    const supabase = createClient()
    const { activeOrganization } = useAuthStore()
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const [allRoles, setAllRoles] = useState<any[]>([])
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

    const fetchRoles = async () => {
        if (!activeOrganization) return
        setIsFetching(true)
        try {
            const { data, error } = await supabase
                .from('roles')
                .select('*')
                .eq('organization_id', activeOrganization.id)
                .order('position', { ascending: true })

            if (error) throw error
            setAllRoles(data || [])

            // Set initial selected roles based on member's current roles
            const initialIds = member.member_roles?.map((mr: any) => mr.role.id) || []
            setSelectedRoleIds(initialIds)
        } catch (err) {
            console.error("Error fetching roles:", err)
        } finally {
            setIsFetching(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchRoles()
        }
    }, [isOpen, activeOrganization?.id])

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
            const { error } = await supabase.rpc('assign_roles_to_member', {
                p_organization_id: activeOrganization.id,
                p_user_id: member.user_id,
                p_role_ids: selectedRoleIds
            })

            if (error) throw error

            toast.success(`Roles updated for ${member.profile?.full_name || 'member'}`)
            setIsOpen(false)
            onSuccess?.()
        } catch (err: any) {
            console.error("Error saving roles:", err)
            toast.error(err.message || "Failed to update roles")
        } finally {
            setIsLoading(false)
        }
    }

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
                        Update roles for {member.profile?.full_name || 'this member'}. Changes take effect immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isFetching ? (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {allRoles.map((role) => (
                                <div key={role.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card/50">
                                    <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedRoleIds.includes(role.id)}
                                        onCheckedChange={() => handleToggleRole(role.id)}
                                    // Disable system roles like owner to prevent accidental removal?
                                    // For now let the RPC handle the security logic.
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer"
                                        >
                                            <div
                                                className="size-2 rounded-full"
                                                style={{ backgroundColor: role.color || '#95a5a6' }}
                                            />
                                            {role.name}
                                            {role.is_system_role && (
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

// Minimal Badge helper if not imported
function Badge({ children, className, variant = "default" }: any) {
    const variants: any = {
        default: "bg-primary text-primary-foreground",
        outline: "border border-border text-muted-foreground",
    }
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}>
            {children}
        </span>
    )
}
