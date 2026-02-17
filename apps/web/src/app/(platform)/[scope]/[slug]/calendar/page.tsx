"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useScopeContext } from "@/contexts/scope-context"
import { Calendar } from "lucide-react"

export default function CalendarPage() {
    const { scope, isPersonal } = useScopeContext()

    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Calendar"
                description={`Manage your ${isPersonal ? 'personal' : 'organization'} schedule`}
            />
            <main className="flex-1 p-6">
                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-muted-foreground italic">Coming Soon</CardTitle>
                                <CardDescription>This feature is currently under development.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground/60 italic">
                        Your schedule and events will be synced here.
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
