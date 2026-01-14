"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Settings,
    Shield,
    CreditCard,
    History,
    LogOut,
    ChevronRight,
    Terminal,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "@/stores/auth-store"
import { useAuthActions } from "@convex-dev/auth/react"

const adminNavItems = [
    { title: "Overview", href: "/admin", icon: LayoutDashboard },
    { title: "Subscription Tiers", href: "/admin/tiers", icon: CreditCard },
    { title: "Bitwise Permissions", href: "/admin/permissions", icon: Shield },
    { title: "Audit Logs", href: "/admin/logs", icon: History },
    { title: "System Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const { profile, signOut: clearAuthStore } = useAuthStore()
    const { state } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { signOut: convexSignOut } = useAuthActions()

    const handleSignOut = async () => {
        await convexSignOut()
        clearAuthStore()
        window.location.href = "/"
    }

    return (
        <Sidebar collapsible="icon" className="border-r border-border bg-zinc-950" {...props}>
            <SidebarHeader className="h-16 flex items-center p-2">
                <div className="flex w-full items-center gap-3">
                    <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-lg shadow-blue-500/20">
                        <Terminal className="size-5" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col leading-none">
                            <span className="font-bold text-lg tracking-tight">Staff Panel</span>
                            <span className="text-[10px] text-blue-400 uppercase tracking-widest font-black mt-0.5">
                                Godmode
                            </span>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="gap-4 px-2">
                <div className="mt-4 px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                    Administration
                </div>
                <SidebarMenu>
                    {adminNavItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        return (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    isActive={isActive}
                                    className={cn(
                                        "transition-all duration-200 h-10",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400 font-bold shadow-xs ring-1 ring-blue-500/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    <Link href={item.href}>
                                        <item.icon className={cn("size-4", isActive ? "text-blue-400" : "")} />
                                        <span>{item.title}</span>
                                        {isActive && <ChevronRight className="ml-auto size-3.5 opacity-50" />}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                        <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                            <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} />
                            <AvatarFallback className="rounded-lg bg-blue-600/10 text-blue-400 font-bold">
                                {profile?.displayName?.charAt(0).toUpperCase() || "A"}
                            </AvatarFallback>
                        </Avatar>
                        {!isCollapsed && (
                            <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                                <span className="truncate font-bold text-white">
                                    {profile?.displayName}
                                </span>
                                <span className="truncate text-[10px] uppercase text-blue-400 font-black">Admin</span>
                            </div>
                        )}
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleSignOut}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-2"
                        >
                            <LogOut className="size-4" />
                            <span>Exit Panel</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
