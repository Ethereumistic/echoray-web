"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import type { Id } from "../../../convex/_generated/dataModel"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save, AlertTriangle, Trash2, LogOut } from "lucide-react"
import { organizationSchema, type OrganizationFormValues } from "@/lib/validations"
import { useRouter } from "next/navigation"
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

/**
 * Form to manage the current active organization's settings.
 */
export function OrgSettingsForm() {
    const updateOrg = useMutation(api.organizations.updateOrganization)
    const deleteOrg = useMutation(api.organizations.deleteOrganization)
    const removeMember = useMutation(api.members.removeMember)
    const { activeOrganization, setActiveOrganization, profile, hasPermission } = useAuthStore()
    const router = useRouter()

    const [isLoading, setIsLoading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmName, setConfirmName] = useState("")
    const [confirmLeave, setConfirmLeave] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormValues, string>>>({})

    useEffect(() => {
        if (activeOrganization) {
            setName(activeOrganization.name)
            setDescription(activeOrganization.description || "")
        }
    }, [activeOrganization])

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrganization) return

        setErrors({})
        const validation = organizationSchema.safeParse({
            name,
            description
        })

        if (!validation.success) {
            const fieldErrors: Partial<Record<keyof OrganizationFormValues, string>> = {}
            validation.error.issues.forEach(issue => {
                const path = issue.path[0] as keyof OrganizationFormValues
                fieldErrors[path] = issue.message
            })
            setErrors(fieldErrors)
            return
        }

        setIsLoading(true)
        try {
            await updateOrg({
                id: activeOrganization._id,
                name,
                description: description || undefined,
            })

            toast.success("Organization updated successfully")
            setActiveOrganization({
                ...activeOrganization,
                name,
                description: description || undefined,
            })
        } catch (err) {
            console.error("Error updating organization:", err)
            const message = err instanceof Error ? err.message : "Failed to update organization"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!activeOrganization) return
        if (confirmName !== activeOrganization.name) {
            toast.error("Name confirmation does not match")
            return
        }

        setIsDeleting(true)
        try {
            await deleteOrg({ id: activeOrganization._id })
            toast.success("Organization deleted successfully")
            setActiveOrganization(null)
            router.push("/dashboard")
        } catch (err) {
            console.error("Error deleting organization:", err)
            const message = err instanceof Error ? err.message : "Failed to delete organization"
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleLeave = async () => {
        if (!activeOrganization || !profile) return
        if (confirmLeave !== activeOrganization.name) {
            toast.error("Name confirmation does not match")
            return
        }

        setIsDeleting(true)
        try {
            await removeMember({
                organizationId: activeOrganization._id,
                targetUserId: profile.id as Id<"users">
            })
            toast.success("You have left the organization")
            setActiveOrganization(null)
            router.push("/dashboard")
        } catch (err) {
            console.error("Error leaving organization:", err)
            const message = err instanceof Error ? err.message : "Failed to leave organization"
            toast.error(message)
        } finally {
            setIsDeleting(false)
        }
    }

    if (!activeOrganization) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                No active organization selected.
            </div>
        )
    }

    // const canDelete = activeOrganization.ownerId === profile?.id || hasPermission('system.admin') || hasPermission('system.support')

    return (
        <div className="space-y-10">
            <Card className="border-border/50 shadow-sm">
                <form onSubmit={handleUpdate}>
                    <CardHeader>
                        <CardTitle>Global Settings</CardTitle>
                        <CardDescription>
                            Manage your organization&apos;s public profile and basic information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input
                                id="org-name"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                                }}
                                required
                                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="org-description">Description</Label>
                            <Textarea
                                id="org-description"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
                                }}
                                className={`min-h-[100px] bg-background/50 ${errors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end border-t border-border/50 pt-6">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                        <AlertTriangle className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-destructive">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Irreversible actions for your organization. Proceed with extreme caution.
                        </p>
                    </div>
                </div>

                {activeOrganization.ownerId === profile?.id ? (
                    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                Delete Organization
                            </CardTitle>
                            <CardDescription className="text-destructive/80 text-sm">
                                Deleting this organization will permanently remove all of its data, including projects,
                                roles, and member associations. This action cannot be undone.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="bg-destructive/10 border-t border-destructive/20 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-[11px] font-medium text-destructive/70 flex items-center gap-1.5 uppercase tracking-wider">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                                Final Action: Irreversible
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="font-bold shadow-lg shadow-destructive/20 hover:scale-105 transition-transform">
                                        <Trash2 className="mr-2 size-4" />
                                        Delete Organization
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border-destructive/20 max-w-md">
                                    <AlertDialogHeader>
                                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                            <AlertTriangle className="size-6 text-destructive" />
                                        </div>
                                        <AlertDialogTitle className="text-center text-xl">Delete Organization?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-center">
                                            This will permanently delete <span className="font-bold text-foreground">{activeOrganization.name}</span>.
                                            All project data and member roles will be lost forever.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-6 space-y-3">
                                        <Label htmlFor="confirm-name" className="text-xs  font-bold tracking-widest text-muted-foreground/70 text-center block">
                                            Enter the full name <span className="text-foreground select-all font-mono px-2 py-1 bg-muted rounded border border-border/50">{activeOrganization.name}</span> below
                                        </Label>
                                        <Input
                                            id="confirm-name"
                                            placeholder="Organization Name"
                                            value={confirmName}
                                            onChange={(e) => setConfirmName(e.target.value)}
                                            className="h-11 text-center font-mono border-destructive/30 focus-visible:ring-destructive"
                                        />
                                    </div>
                                    <AlertDialogFooter className="sm:flex-col gap-2">
                                        <Button
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={isDeleting || confirmName !== activeOrganization.name}
                                            className="w-full h-11 font-bold order-1"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Deleting Organization...
                                                </>
                                            ) : (
                                                "Completely Delete Organization"
                                            )}
                                        </Button>
                                        <AlertDialogCancel className="w-full h-11 order-2 mt-0">Keep Organization</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ) : (
                    <Card className="border-destructive/20 bg-destructive/5 overflow-hidden shadow-sm">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                Leave Organization
                            </CardTitle>
                            <CardDescription className="text-destructive/80 text-sm">
                                You will lose access to all projects and data within this organization.
                                To rejoin, you will need to be re-invited by an administrator.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="bg-destructive/10 border-t border-destructive/20 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-[11px] font-medium text-destructive/70 flex items-center gap-1.5 uppercase tracking-wider">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                                Action: Leave Organization
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm" className="font-bold shadow-lg shadow-destructive/20 hover:scale-105 transition-transform">
                                        <LogOut className="mr-2 size-4" />
                                        Leave Organization
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border-destructive/20 max-w-md">
                                    <AlertDialogHeader>
                                        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                                            <AlertTriangle className="size-6 text-destructive" />
                                        </div>
                                        <AlertDialogTitle className="text-center text-xl">Leave Organization?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-center">
                                            Are you sure you want to leave <span className="font-bold text-foreground">{activeOrganization.name}</span>?
                                            You will no longer be able to collaborate with this team.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="py-6 space-y-3">
                                        <Label htmlFor="confirm-leave" className="text-xs font-bold tracking-widest text-muted-foreground/70 text-center block">
                                            Confirm by typing <span className="text-foreground select-all font-mono px-2 py-1 bg-muted rounded border border-border/50">{activeOrganization.name}</span>
                                        </Label>
                                        <Input
                                            id="confirm-leave"
                                            placeholder="Type organization name"
                                            value={confirmLeave}
                                            onChange={(e) => setConfirmLeave(e.target.value)}
                                            className="h-11 text-center font-mono border-destructive/30 focus-visible:ring-destructive"
                                        />
                                    </div>
                                    <AlertDialogFooter className="sm:flex-col gap-2">
                                        <Button
                                            variant="destructive"
                                            onClick={handleLeave}
                                            disabled={isDeleting || confirmLeave !== activeOrganization.name}
                                            className="w-full h-11 font-bold order-1"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Leaving...
                                                </>
                                            ) : (
                                                "Confirm Leaving Organization"
                                            )}
                                        </Button>
                                        <AlertDialogCancel className="w-full h-11 order-2 mt-0">Stay in Organization</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </div>
    )
}
