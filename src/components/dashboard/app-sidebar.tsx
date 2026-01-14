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
    Lock,
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore, Organization } from "@/stores/auth-store"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

// --- Nav Items ---
interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    roles?: string[]
    items?: { title: string; href: string }[]
    organizationOnly?: boolean
}

const getNavItems = (
    orgSlug?: string,
    userSlug?: string,
    canCreateProjects?: boolean,
    organizations?: Organization[]
): NavItem[] => {
    const items: NavItem[] = [
        { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
    ]

    // Organization workspace link (only if org is selected)
    if (orgSlug) {
        items.push({
            title: "Workspace",
            href: `/o/${orgSlug}`,
            icon: Building2,
            organizationOnly: true
        })
    }

    // Personal projects href
    const personalProjectsHref = userSlug ? `/p/${userSlug}/projects` : "/dashboard/projects"

    // Projects item - different based on permission
    if (canCreateProjects && organizations && organizations.length > 0) {
        // Users with project.create: Show dropdown with Personal + Org projects
        const projectSubItems = [
            { title: "Personal Projects", href: personalProjectsHref },
        ]

        // Add each organization's projects
        for (const org of organizations) {
            projectSubItems.push({
                title: org.name,
                href: `/o/${org.slug}/projects`,
            })
        }

        items.push({
            title: "Projects",
            href: orgSlug ? `/o/${orgSlug}/projects` : personalProjectsHref,
            icon: FolderOpen,
            items: projectSubItems
        })
    } else {
        // Free users: Simple button to personal projects (no dropdown)
        items.push({
            title: "Projects",
            href: personalProjectsHref,
            icon: FolderOpen,
            // No items = no dropdown
        })
    }

    items.push(
        {
            title: "Documents",
            href: orgSlug ? `/o/${orgSlug}/documents` : "/dashboard/documents",
            icon: FileText
        },
        {
            title: "Team",
            href: orgSlug ? `/o/${orgSlug}/settings?tab=members` : "/dashboard/team",
            icon: Users,
        }
    )

    if (orgSlug) {
        items.push({
            title: "Workspace Settings",
            href: `/o/${orgSlug}/settings`,
            icon: Settings
        })
    } else {
        items.push({ title: "Settings", href: "/dashboard/settings", icon: Settings })
    }

    return items
}

// --- Organizations (Mock) ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const {
        profile,
        organizations,
        activeOrganization,
        setActiveOrganization,
        signOut: clearAuthStore
    } = useAuthStore()
    const { state, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { signOut: convexSignOut } = useAuthActions()

    // Check if user can create organizations (based on tier limits)
    const orgCapability = useQuery(api.users.canCreateOrganization)
    const canCreateOrg = orgCapability?.canCreate ?? false

    // Check if user can create projects (Web tier and above)
    const projectCapability = useQuery(api.projects.canCreateProject)
    const canCreateProjects = projectCapability?.canCreate ?? false

    const handleSignOut = async () => {
        await convexSignOut()
        clearAuthStore()
        window.location.href = "/"
    }

    // Get user slug for personal workspace routes
    const userSlug = profile?.displayName?.toLowerCase().replace(/\s+/g, '-') ||
        profile?.email?.split('@')[0] ||
        'me'

    const navItems = getNavItems(activeOrganization?.slug, userSlug, canCreateProjects, organizations)

    // Permission-based filtering
    const { hasPermission } = useAuthStore()
    const filteredNavItems = navItems.filter((item) => {
        if (!item.roles) return true
        // Use permissions system instead of legacy roles
        return item.roles.some((role) => hasPermission(role))
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
                                {profile?.subscriptionTier?.name || 'Free'}
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
                                        <span className="truncate text-xs text-muted-foreground">{activeOrganization?.name || "Personal Workspace"}</span>
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

                                {activeOrganization && (
                                    <DropdownMenuItem
                                        onClick={() => router.push(`/o/${activeOrganization.slug}/settings`)}
                                        className="gap-2 p-2 rounded-lg text-primary bg-primary/5 border border-primary/10"
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-md border border-primary/20 bg-primary/10">
                                            <Settings className="size-3.5" />
                                        </div>
                                        <span className="text-sm font-semibold">Workspace Settings</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                    Switch Workspace
                                </DropdownMenuLabel>
                                {organizations?.map((org) => (
                                    <DropdownMenuItem
                                        key={org._id}
                                        onClick={() => {
                                            setActiveOrganization(org)
                                            router.push(`/o/${org.slug}`)
                                        }}
                                        className="gap-2 p-2 rounded-lg"
                                    >
                                        <div className="flex size-6 items-center justify-center rounded-md border bg-muted/30">
                                            <Building2 className="size-3.5" />
                                        </div>
                                        <span className="text-sm font-medium">{org.name}</span>
                                        {activeOrganization?._id === org._id && <Check className="ml-auto size-4 text-primary" />}
                                    </DropdownMenuItem>
                                ))}

                                {/* Create Organization - conditionally locked based on tier limits */}
                                {canCreateOrg ? (
                                    <DropdownMenuItem asChild className="gap-2 p-2 rounded-lg text-muted-foreground cursor-pointer">
                                        <Link href="/dashboard/organizations/create" className="flex items-center gap-2">
                                            <Plus className="size-4" />
                                            <span className="text-sm">Create Organization</span>
                                        </Link>
                                    </DropdownMenuItem>
                                ) : (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground/50 cursor-not-allowed select-none">
                                                <Lock className="size-4" />
                                                <span className="text-sm">Create Organization</span>
                                                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                    Upgrade
                                                </span>
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            side="right"
                                            align="start"
                                            className="w-72 p-4 bg-background/95 backdrop-blur-sm border border-border shadow-xl"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 rounded-lg bg-amber-500/10">
                                                        <Lock className="size-4 text-amber-500" />
                                                    </div>
                                                    <h4 className="font-semibold text-sm">Feature Locked</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {orgCapability?.reason || "Upgrade your plan to create organizations."}
                                                </p>
                                                <Link
                                                    href="/dashboard/subscription"
                                                    className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-primary/80 rounded-lg hover:opacity-90 transition-opacity"
                                                >
                                                    View Upgrade Options
                                                </Link>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}

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
