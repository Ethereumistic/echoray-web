"use client"

import { DashboardHeader } from '@/components/dashboard/header'
import { Button } from '@echoray/ui/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useScopeContext } from '@/contexts/scope-context'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../../../../convex/_generated/api'
import { Id } from '../../../../../../convex/_generated/dataModel'
import { UploadInterface } from '@/components/upload/upload-interface'
import { Card, CardContent } from '@echoray/ui/components/ui/card'
import { useEffect } from 'react'

/**
 * File Upload - System App
 * Route: /p/[userId]/upload or /o/[orgId]/upload
 * 
 * Handles file uploads to GitHub repos via Convex → GitHub → jsDelivr CDN
 */
export default function UploadPage() {
    const { scope, slug, isPersonal } = useScopeContext()
    const currentUser = useQuery(api.users.currentUser)
    const ensureRepoExists = useMutation(api.repos.ensureRepoExists)

    // Determine entity ID based on scope
    const entityId = isPersonal
        ? (currentUser?._id as Id<"users"> | undefined)
        : undefined // TODO: Get org ID from slug

    // Get or create repo for this entity
    const repo = useQuery(
        api.repos.getRepoByEntity,
        entityId ? { entityId } : "skip"
    )

    // Ensure repo exists when component mounts
    useEffect(() => {
        if (!entityId || repo !== null) return

        // Create repo if it doesn't exist
        const createRepo = async () => {
            try {
                await ensureRepoExists({
                    type: isPersonal ? "personal" : "organization",
                    entityId: entityId!,
                })
            } catch (error) {
                console.error("Failed to create repo:", error)
            }
        }

        createRepo()
    }, [entityId, repo, isPersonal, ensureRepoExists])

    // Loading state
    if (!currentUser || entityId === undefined) {
        return (
            <div className="flex flex-col">
                <DashboardHeader
                    appName="File Upload"
                    description="Upload and manage your files"
                />
                <main className="flex-1 p-6 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </main>
            </div>
        )
    }

    // Authorization check for personal scope
    // In personal scope, slug is the user ID
    if (isPersonal && currentUser._id !== slug) {
        return (
            <div className="flex flex-col">
                <DashboardHeader
                    appName="Unauthorized"
                    description="You don't have access to this upload page"
                />
                <main className="flex-1 p-6">
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="pt-6">
                            <p className="text-destructive">You can only upload files to your own profile.</p>
                            <Link href={`/p/${currentUser._id}/upload`}>
                                <Button className="mt-4">
                                    Go to your upload page
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </main>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader
                appName="File Upload"
                description="Upload files to your GitHub CDN repository"
            />

            <main className="flex-1 p-6 space-y-6 ">
                {/* Upload Interface */}
                {repo?._id ? (
                    <UploadInterface repoId={repo._id} repoStatus={repo.status} />
                ) : (
                    <Card>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            <p className="text-muted-foreground">Initializing repository...</p>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
