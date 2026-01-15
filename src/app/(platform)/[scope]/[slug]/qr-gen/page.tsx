"use client"

import { DashboardHeader } from '@/components/dashboard/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, ArrowLeft, Construction } from 'lucide-react'
import Link from 'next/link'
import { useScopeContext } from '@/contexts/scope-context'

/**
 * QR Code Generator - Pre-built System App
 * Route: /p/[userId]/qr-gen or /o/[orgId]/qr-gen
 * 
 * This route takes precedence over [projectId] due to Next.js route specificity.
 */
export default function QRGenPage() {
    const { scope, slug } = useScopeContext()

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="QR Code Generator"
                description="Generate QR codes for your projects"
            />

            <main className="flex-1 p-6 space-y-6">
                {/* Back Link */}
                <div className="flex items-center gap-2">
                    <Link href={`/${scope}/${slug}`}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Workspace
                        </Button>
                    </Link>
                </div>

                {/* Coming Soon Card */}
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <QrCode className="h-10 w-10 text-primary" />
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Construction className="h-5 w-5 text-amber-500" />
                            <h3 className="text-lg font-semibold">Coming Soon</h3>
                        </div>
                        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                            Generate custom QR codes for your projects, products, and marketing materials.
                            Link them to any URL, contact info, or custom data.
                        </p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                Custom Styling
                            </span>
                            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                Logo Embedding
                            </span>
                            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                Dynamic Links
                            </span>
                            <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                                Analytics
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
