"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Settings,
    Users,
    FolderOpen,
    FileText,
    LogOut,
    Building2,
    Check,
    ChevronsUpDown,
    CreditCard,
    Wallet,
    Bell,
    ChevronRight,
    Plus,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore, type UserRole } from "@/stores/auth-store"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Image from "next/image"

// --- Nav Items ---
interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    roles?: UserRole[]
    items?: { title: string; href: string }[]
}

const navItems: NavItem[] = [
    { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    {
        title: "Projects",
        href: "/dashboard/projects",
        icon: FolderOpen,
        items: [
            { title: "Active Projects", href: "/dashboard/projects/active" },
            { title: "Archived", href: "/dashboard/projects/archived" },
            { title: "New Project", href: "/dashboard/projects/new" },
        ]
    },
    { title: "Documents", href: "/dashboard/documents", icon: FileText },
    {
        title: "Team",
        href: "/dashboard/team",
        icon: Users,
        roles: ["admin", "team_member"],
    },
    { title: "Settings", href: "/dashboard/settings", icon: Settings },
]

// --- Organizations (Mock) ---
const organizations = [
    { name: "Personal Account", id: "personal", logo: Building2 },
    { name: "Echoray Team", id: "echoray", logo: Building2 },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, signOut: clearAuthStore } = useAuthStore()
    const { state, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"

    const [activeOrg, setActiveOrg] = React.useState(organizations[0])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        clearAuthStore()
        router.push("/")
    }

    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true
        return profile?.role && item.roles.includes(profile.role)
    })

    return (
        <Sidebar collapsible="icon" className="border-r border-border" {...props}>
            <SidebarHeader className="h-16 flex items-center p-2">
                <div className="flex w-full items-center gap-3">
                    <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
                        <Image
                            src="/logo/logo.png"
                            alt="Logo"
                            width={24}
                            height={24}
                            className="invert brightness-0"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col leading-none transition-all duration-300">
                            <span className="font-bold text-lg tracking-tight">Echoray</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5">
                                {profile?.role || 'user'}
                            </span>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="-px-2 gap-4">
                <SidebarGroup>
                    <div className="px-2 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                        Main Navigation
                    </div>
                    <SidebarMenu>
                        {filteredNavItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

                            if (item.items) {
                                return (
                                    <Collapsible
                                        key={item.href}
                                        asChild
                                        defaultOpen={isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                    className={cn(
                                                        "transition-all duration-200",
                                                        isActive
                                                            ? "text-primary font-bold"
                                                            : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    <item.icon className={cn("size-4", isActive ? "text-primary" : "")} />
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.href}>
                                                            <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                                                <Link href={subItem.href}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            }

                            return (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={isActive}
                                        className={cn(
                                            "transition-all duration-200",
                                            isActive
                                                ? "bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/20"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Link href={item.href}>
                                            <item.icon className={cn("size-4", isActive ? "text-primary" : "")} />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground ring-1 ring-border/50 shadow-xs rounded-xl"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                                        <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} />
                                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                                            {profile?.displayName?.charAt(0).toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight ml-1">
                                        <span className="truncate font-bold">
                                            {profile?.displayName}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">{activeOrg.name}</span>
                                    </div>
                                    <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-xl p-2"
                                side={isMobile ? "bottom" : "right"}
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={profile?.avatarUrl} alt={profile?.displayName} />
                                            <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                                                {profile?.displayName?.charAt(0).toUpperCase() || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{profile?.displayName}</span>
                                            <span className="truncate text-xs text-muted-foreground">{profile?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                    Organizations
                                </DropdownMenuLabel>
                                {organizations.map((org) => (
                                    <DropdownMenuItem
                                        key={org.id}
                                        onClick={() => setActiveOrg(org)}
                                        className="gap-2 p-2 rounded-lg"
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-md border bg-muted/30">
                                            <org.logo className="size-3.5" />
                                        </div>
                                        <span className="text-sm font-medium">{org.name}</span>
                                        {activeOrg.id === org.id && <Check className="ml-auto size-4 text-primary" />}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem className="gap-2 p-2 rounded-lg text-muted-foreground">
                                    <Plus className="size-4" />
                                    <span className="text-sm">Create Organization</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/notifications" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <Bell className="size-4" />
                                        <span>Notifications</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/billing" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <Wallet className="size-4" />
                                        <span>Billing</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/subscription" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <CreditCard className="size-4" />
                                        <span>Subscription</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <Settings className="size-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={handleSignOut}
                                    className="text-destructive focus:bg-destructive focus:text-destructive-foreground flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                                >
                                    <LogOut className="size-4" />
                                    <span>Sign out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
