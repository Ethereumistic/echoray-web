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
import { useAuthStore } from "@/stores/auth-store"

/**
 * Page to create a new organization.
 * Route: /o/create
 * Uses the bitwise create_organization RPC.
 */
export default function CreateOrganizationPage() {
    const router = useRouter()
    const { profile } = useAuthStore()
    const createOrg = useMutation(api.organizations.createOrganization)

    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState("")
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
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const validation = organizationSchema.safeParse({ name, description })

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
                description: description || undefined,
            })

            toast.success("Organization created successfully!")

            // Redirect to personal workspace
            router.push(`/p/${profile?.id}`)
        } catch (err) {
            console.error("Error creating organization:", err)
            const message = err instanceof Error ? err.message : "Failed to create organization"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Get back URL (personal workspace)
    const backUrl = profile?.id ? `/p/${profile.id}` : '/'

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={backUrl}>
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
                            <Link href={backUrl}>Cancel</Link>
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
