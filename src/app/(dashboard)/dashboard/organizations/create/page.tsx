"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "convex/react"
import { api } from "@/../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Building2, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { organizationSchema, type OrganizationFormValues } from "@/lib/validations"

/**
 * Page to create a new organization.
 * Uses the bitwise create_organization RPC.
 */
export default function CreateOrganizationPage() {
    const router = useRouter()
    const createOrg = useMutation(api.organizations.createOrganization)
    // No auth store variables needed currently
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
    const [slug, setSlug] = useState("")
    const [description, setDescription] = useState("")
    const [errors, setErrors] = useState<Partial<Record<keyof OrganizationFormValues, string>>>({})

    // Simple slugification
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setName(val)

        // Clear error if it exists
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: undefined }))
        }

        // Only auto-generate slug if it was empty or matched the previous name conversion
        const suggestedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        setSlug(suggestedSlug)

        // Clear slug error if it exists
        if (errors.slug) {
            setErrors(prev => ({ ...prev, slug: undefined }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const validation = organizationSchema.safeParse({ name, slug, description })

        if (!validation.success) {
            const fieldErrors: Partial<Record<keyof OrganizationFormValues, string>> = {}
            validation.error.issues.forEach(issue => {
                const path = issue.path[0] as keyof OrganizationFormValues
                if (!fieldErrors[path]) fieldErrors[path] = issue.message
            })
            setErrors(fieldErrors)
            toast.error("Please fix the validation errors")
            return
        }

        setIsLoading(true)
        try {
            await createOrg({
                name,
                slug,
                description: description || undefined,
            })

            toast.success("Organization created successfully!")

            // Redirect to dashboard
            router.push("/dashboard")
        } catch (err) {
            console.error("Error creating organization:", err)
            const message = err instanceof Error ? err.message : "Failed to create organization"
            toast.error(message)
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
                            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Organization Name</Label>
                            <Input
                                id="name"
                                placeholder="Echoray Ltd"
                                value={name}
                                onChange={handleNameChange}
                                required
                                className={`bg-background/50 ${errors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug" className={errors.slug ? "text-destructive" : ""}>Workspace Slug</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground text-sm font-mono">echoray.io/o/</span>
                                <Input
                                    id="slug"
                                    placeholder="echoray-ltd"
                                    value={slug}
                                    onChange={(e) => {
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))
                                        if (errors.slug) setErrors(prev => ({ ...prev, slug: undefined }))
                                    }}
                                    required
                                    className={`bg-background/50 font-mono ${errors.slug ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                />
                            </div>
                            {errors.slug ? (
                                <p className="text-xs text-destructive">{errors.slug}</p>
                            ) : (
                                <p className="text-[10px] text-muted-foreground">
                                    This will be used in your unique URL. Only lowercase letters, numbers, and hyphens.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className={errors.description ? "text-destructive" : ""}>Description (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="A brief description of your organization's purpose."
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value)
                                    if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
                                }}
                                className={`min-h-[100px] bg-background/50 resize-none ${errors.description ? "border-destructive focus-visible:ring-destructive" : ""}`}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
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
