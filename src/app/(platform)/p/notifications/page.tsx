"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

export default function PersonalNotificationsPage() {
    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Notifications"
                description="Manage your personal alerts and updates"
            />
            <main className="flex-1 p-6">
                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-muted-foreground italic">Coming Soon</CardTitle>
                                <CardDescription>Notification settings are under construction.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground/60 italic">
                        Your personal notifications and activity notifications will appear here.
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
