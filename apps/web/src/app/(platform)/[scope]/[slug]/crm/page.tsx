"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useScopeContext } from "@/contexts/scope-context"
import { Users } from "lucide-react"

export default function CRMPage() {
    const { scope, isPersonal } = useScopeContext()

    if (isPersonal) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <h2 className="text-2xl font-bold">CRM Not Available</h2>
                <p className="text-muted-foreground">The CRM is an organization-level feature.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="CRM"
                description="Manage your organization's customers and relationships"
            />
            <main className="flex-1 p-6">
                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-muted-foreground italic">Coming Soon</CardTitle>
                                <CardDescription>This feature is currently under development.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground/60 italic">
                        Customer Relationship Management tools will be available here.
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
