"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    UserPlus,
    Shield,
    Settings,
    PlusCircle,
    ArrowRight
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { InviteMemberDialog } from "./invite-member-dialog"
import { PermissionGuard } from "./permission-guard"
import { PermissionCode } from "@/types/permissions"

interface Action {
    title: string
    description: string
    icon: React.ReactNode
    permission: PermissionCode
    component?: React.ReactNode
    href?: string
    color: string
}

/**
 * OrgQuickActions provides a grid of common shortcuts for organization management.
 * Designed with a premium, glassmorphic look.
 */
export function OrgQuickActions({ onMemberInvited }: { onMemberInvited?: () => void }) {
    const { slug } = useParams()

    const actions: Action[] = [
        {
            title: "Invite Member",
            description: "Add a new team member to your organization.",
            icon: <UserPlus className="h-5 w-5 text-indigo-400" />,
            permission: "members.invite",
            component: <InviteMemberDialog onSuccess={onMemberInvited} />,
            color: "from-indigo-500/10 to-purple-500/10 hover:border-indigo-500/30"
        },
        {
            title: "Manage Roles",
            description: "Create and customize permissions for your team.",
            icon: <Shield className="h-5 w-5 text-emerald-400" />,
            permission: "roles.manage",
            href: `/o/${slug}/settings?tab=roles`,
            color: "from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/30"
        },
        {
            title: "Org Settings",
            description: "Update organization name, slug, and description.",
            icon: <Settings className="h-5 w-5 text-amber-400" />,
            permission: "org.settings",
            href: `/o/${slug}/settings`,
            color: "from-amber-500/10 to-orange-500/10 hover:border-amber-500/30"
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actions.map((action, index) => (
                <PermissionGuard key={index} permission={action.permission}>
                    <Card className={`group relative overflow-hidden border-border/40 bg-linear-to-br ${action.color} backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]`}>
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            {action.icon}
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                {action.icon}
                                {action.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                {action.description}
                            </p>
                            {action.href ? (
                                <Button asChild variant="ghost" size="sm" className="w-full justify-between hover:bg-white/5 active:bg-white/10 group-hover:px-4 transition-all">
                                    <Link href={action.href}>
                                        Explore
                                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                    </Link>
                                </Button>
                            ) : (
                                <div className="w-full">
                                    {action.component}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </PermissionGuard>
            ))}

            {/* Generic placeholder for adding more modules */}
            <Card className="flex flex-col items-center justify-center border-dashed border-border/60 bg-transparent hover:border-primary/40 transition-colors p-6 text-center group cursor-pointer">
                <PlusCircle className="h-8 w-8 text-muted-foreground/40 group-hover:text-primary/60 transition-colors mb-2" />
                <h4 className="text-xs font-medium text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">Add New Module</h4>
            </Card>
        </div>
    )
}
