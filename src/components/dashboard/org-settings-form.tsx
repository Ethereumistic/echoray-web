"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"

/**
 * Form to manage the current active organization's settings.
 */
export function OrgSettingsForm() {
    const supabase = createClient()
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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeOrganization) return

        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('organizations')
                .update({
                    name,
                    description: description || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', activeOrganization.id)
                .select()
                .single()

            if (error) throw error

            toast.success("Organization updated successfully")
            setActiveOrganization(data)
        } catch (err: any) {
            console.error("Error updating organization:", err)
            toast.error(err.message || "Failed to update organization")
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
                        Manage your organization's public profile and basic information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="org-name">Organization Name</Label>
                        <Input
                            id="org-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
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
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] bg-background/50"
                        />
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
