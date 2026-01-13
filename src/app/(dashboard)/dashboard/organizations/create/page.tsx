"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Building2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

/**
 * Page to create a new organization.
 * Uses the bitwise create_organization RPC.
 */
export default function CreateOrganizationPage() {
    const router = useRouter()
    const supabase = createClient()
    const { user, setActiveOrganization } = useAuthStore()
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")

    // Simple slugification
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)
        // Only auto-generate slug if it was empty or matched the previous name conversion
        setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name || !slug) {
            toast.error("Name and Slug are required")
            return
        }

        setIsLoading(true)
        try {
            const { data: orgId, error } = await supabase.rpc('create_organization', {
                p_name: name,
                p_slug: slug,
                p_description: description || null,
                p_tier_slug: 'user' // Default to free tier
            })

            if (error) throw error

            toast.success("Organization created successfully!")

            // Redirect to dashboard
            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            console.error("Error creating organization:", err)
            toast.error(err.message || "Failed to create organization")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Organization</h2>
                    <p className="text-muted-foreground">
                        Establish a new tenant for your team and projects.
                    </p>
                </div>
            </div>

            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="size-5 text-primary" />
                            Organization Details
                        </CardTitle>
                        <CardDescription>
                            Configure the basic identity of your new organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                placeholder="Echoray Ltd"
                                value={name}
                                onChange={handleNameChange}
                                required
                                className="bg-background/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Workspace Slug</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm font-mono">echoray.io/o/</span>
                                <Input
                                    id="slug"
                                    placeholder="echoray-ltd"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                                    required
                                    className="bg-background/50 font-mono"
                                />
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                This will be used in your unique URL. Only lowercase letters, numbers, and hyphens.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="A brief description of your organization's purpose."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px] bg-background/50 resize-none"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t border-border/50 pt-6">
                        <Button variant="ghost" asChild disabled={isLoading}>
                            <Link href="/dashboard">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={isLoading} className="min-w-[140px]">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Workspace"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
