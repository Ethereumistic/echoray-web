"use client"

import { useState, useEffect } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { organizationSchema, type OrganizationFormValues } from "@/lib/validations"

/**
 * Form to manage the current active organization's settings.
 */
export function OrgSettingsForm() {
    const updateOrg = useMutation(api.organizations.updateOrganization)
    const { activeOrganization, setActiveOrganization } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        if (activeOrganization) {
            setName(activeOrganization.name)
            setDescription(activeOrganization.description || "")
        }
    }, [activeOrganization])

    const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormValues, string>>>({})

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrganization) return

        setErrors({})
        const validation = organizationSchema.safeParse({
            name,
            slug: activeOrganization.slug,
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
            // The active organization in the store will be updated by OrgInitializer
            // but we can also update it manually for immediate feedback
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


    if (!activeOrganization) {
        return (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
                No active organization selected.
            </div>
        )
    }

    return (
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
                        <Label htmlFor="org-slug">Slug</Label>
                        <Input
                            id="org-slug"
                            value={activeOrganization.slug}
                            disabled
                            className="bg-muted font-mono"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Slugs cannot be changed after creation to prevent broken links.
                        </p>
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
    )
}
