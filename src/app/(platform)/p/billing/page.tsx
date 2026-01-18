"use client"

import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CreditCard } from "lucide-react"

export default function PersonalBillingPage() {
    return (
        <div className="flex flex-col">
            <DashboardHeader
                title="Billing & Subscription"
                description="Manage your personal plan and payment methods"
            />
            <main className="flex-1 p-6 space-y-6">
                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-base text-muted-foreground italic">Coming Soon</CardTitle>
                                <CardDescription>Personal billing management is under construction.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground/60 italic">
                        You will be able to manage your personal subscription tier and billing history here.
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
