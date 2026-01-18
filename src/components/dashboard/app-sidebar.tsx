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
import { useAuthStore, Organization, UserProfile, WorkspaceContext } from "@/stores/auth-store"
import { useAuthActions } from "@convex-dev/auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

// --- Types ---
interface SubNavItem {
    title: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    locked?: boolean
    upgradeMessage?: string
}

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    items?: SubNavItem[]
}

// --- Navigation Builders ---

const getPersonalNavItems = (userId: string, tier: string): NavItem[] => {
    const tools: SubNavItem[] = [
        { title: "Notes", href: `/p/${userId}/notes` },
    ]

    // Based on tier (placeholder logic, adjust based on actual tier slugs)
    if (tier === 'Pro' || tier === 'Enterprise' || tier === 'Admin') {
        tools.push(
            { title: "Analytics", href: `/p/${userId}/analytics` },
            { title: "Calendar", href: `/p/${userId}/calendar` }
        )
    } else {
        // Locked items for upsell
        tools.push(
            { title: "Analytics", href: "/p/billing", locked: true, upgradeMessage: "Upgrade to Pro for Analytics" },
            { title: "Calendar", href: "/p/billing", locked: true, upgradeMessage: "Upgrade to Pro for Calendar" }
        )
    }

    return [
        { title: "Overview", href: `/p/${userId}`, icon: LayoutDashboard },
        {
            title: "Tools & Apps",
            href: `/p/${userId}/tools`,
            icon: Wallet,
            items: tools
        },
        { title: "Documents", href: `/p/${userId}/documents`, icon: FileText },
        { title: "Settings", href: "/p/settings", icon: Settings }
    ]
}

const getOrgNavItems = (orgId: string, orgTier: string): NavItem[] => {
    const apps: SubNavItem[] = [
        { title: "CRM", href: `/o/${orgId}/crm` },
    ]

    if (orgTier !== 'Free') {
        apps.push(
            { title: "Analytics", href: `/o/${orgId}/analytics` },
            { title: "Chat", href: `/o/${orgId}/chat` }
        )
    }

    return [
        { title: "Overview", href: `/o/${orgId}`, icon: LayoutDashboard },
        { title: "Projects", href: `/o/${orgId}/projects`, icon: FolderOpen },
        {
            title: "Apps & Tools",
            href: `/o/${orgId}/apps`,
            icon: Wallet,
            items: apps
        },
        { title: "Documents", href: `/o/${orgId}/documents`, icon: FileText },
        { title: "Team", href: `/o/${orgId}/settings?tab=members`, icon: Users },
        { title: "Workspace Settings", href: `/o/${orgId}/settings`, icon: Settings }
    ]
}

// --- Context Switcher Component ---

function ContextSwitcher({
    currentContext,
    organizations,
    profile,
    onContextChange,
    isCollapsed
}: {
    currentContext: WorkspaceContext
    organizations: Organization[]
    profile: UserProfile | null
    onContextChange: (context: WorkspaceContext) => void
    isCollapsed: boolean
}) {
    const initials = profile?.displayName?.charAt(0).toUpperCase() || "U"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="ring-1 -m ring-border/50 shadow-xs h-14">
                    {/* <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {currentContext.type === 'organization' ? (
                            <Building2 className="size-6" />
                        ) : (
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={profile?.avatarUrl} />
                                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </div> */}
                    {!isCollapsed && (
                        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                            <span className="truncate font-bold">
                                {currentContext.type === 'organization' ? currentContext.orgName : "Personal Workspace"}
                            </span>
                            <span className="truncate text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                                {currentContext.type === 'organization' ? "Organization" : "Personal"}
                            </span>
                        </div>
                    )}
                    {!isCollapsed && <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />}
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-64 rounded-xl p-2"
                side="bottom"
                align="start"
                sideOffset={4}
            >
                <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                    Workspaces
                </DropdownMenuLabel>
                <DropdownMenuItem
                    onClick={() => onContextChange({ type: 'personal', userId: profile?.id || 'me' })}
                    className="gap-2 p-2 rounded-lg cursor-pointer"
                >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-muted/30">
                        <Users className="size-3.5" />
                    </div>
                    <span className="text-sm font-medium flex-1">Personal Workspace</span>
                    {currentContext.type === 'personal' && <Check className="size-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {organizations.map((org) => (
                    <DropdownMenuItem
                        key={org._id}
                        onClick={() => onContextChange({ type: 'organization', orgId: org._id, orgName: org.name })}
                        className="gap-2 p-2 rounded-lg cursor-pointer"
                    >
                        <div className="flex size-6 items-center justify-center rounded-md border bg-muted/30">
                            <Building2 className="size-3.5" />
                        </div>
                        <span className="text-sm font-medium flex-1">{org.name}</span>
                        {currentContext.type === 'organization' && currentContext.orgId === org._id && (
                            <Check className="size-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// --- Organizations (Mock) ---
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const {
        profile,
        organizations,
        activeOrganization,
        currentContext,
        setCurrentContext,
        signOut: clearAuthStore,
        hasPermission
    } = useAuthStore()
    const { state, isMobile } = useSidebar()
    const isCollapsed = state === "collapsed"
    const { signOut: convexSignOut } = useAuthActions()

    const handleSignOut = async () => {
        await convexSignOut()
        clearAuthStore()
        router.refresh()
        router.push('/')
    }

    // Determine current nav items
    const navItems = React.useMemo(() => {
        if (currentContext.type === 'organization') {
            return getOrgNavItems(currentContext.orgId, activeOrganization?.subscriptionTier?.name || 'Free')
        } else {
            return getPersonalNavItems(profile?.id || 'me', profile?.subscriptionTier?.name || 'Free')
        }
    }, [currentContext, profile, activeOrganization])

    // Filter based on existing routes/permissions if needed
    // (For now following the plan's direct routes)
    const filteredNavItems = navItems

    return (
        <Sidebar collapsible="icon" className="border-r border-border " {...props}>
            <SidebarHeader className="px-2 gap-2 ">
                <div className="flex w-full items-center gap-3 px-2 h-14 border-b border-border">
                    <Link href="/" className=" flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo/wifi-dark.png"
                            alt="Logo"
                            width={36}
                            height={36}
                            className="mt-0.5"
                        />
                        {!isCollapsed && <span className="font-bold text-lg tracking-tight">Echoray</span>}
                    </Link>
                </div>

                <div className="px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 group-data-[collapsible=icon]:hidden">
                    Workspaces
                </div>

                <ContextSwitcher
                    currentContext={currentContext}
                    organizations={organizations || []}
                    profile={profile}
                    onContextChange={(context) => {
                        setCurrentContext(context)
                        if (context.type === 'organization') {
                            router.push(`/o/${context.orgId}`)
                        } else {
                            router.push(`/p/${profile?.id || 'me'}`)
                        }
                    }}
                    isCollapsed={isCollapsed}
                />
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
                                                                <Link
                                                                    href={subItem.locked ? "#" : subItem.href}
                                                                    className={cn(subItem.locked && "opacity-50 cursor-not-allowed pointer-events-none")}
                                                                >
                                                                    <span>{subItem.title}</span>
                                                                    {subItem.locked && (
                                                                        <Lock className="ml-auto size-3 text-amber-500" />
                                                                    )}
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
                                className="w-64 rounded-xl p-2"
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

                                <DropdownMenuItem asChild>
                                    <Link href="/p/notifications" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <Bell className="size-4" />
                                        <span>Notifications</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/p/billing" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <Wallet className="size-4" />
                                        <span>Billing & Subscription</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/p/settings" className="flex items-center gap-2 p-2 rounded-lg cursor-pointer">
                                        <Settings className="size-4" />
                                        <span>Personal Settings</span>
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
