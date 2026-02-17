"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Globe, Terminal, Settings2, LogIn } from "lucide-react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthStore, createProfileFromConvexUser } from "@/stores/auth-store"
import { useConvexAuth, useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"

const services: { title: string; href: string; description: string; icon: React.ReactNode }[] = [
    {
        title: "Professional Websites",
        href: "/services/websites",
        description: "Fast, beautiful, and built to find you customers.",
        icon: <Globe className="h-5 w-5" />,
    },
    {
        title: "Custom Web Apps",
        href: "/services/web-apps",
        description: "Dashboards and tools built for your users.",
        icon: <Terminal className="h-5 w-5" />,
    },
    {
        title: "Business Systems",
        href: "/services/crm",
        description: "Custom CRMs to manage and scale your business.",
        icon: <Settings2 className="h-5 w-5" />,
    },
]

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const { isAuthenticated: isConvexAuthenticated } = useConvexAuth()
    const { profile: storeProfile, setUserId, setProfile } = useAuthStore()

    // Fetch current user from Convex
    const user = useQuery(api.users.currentUser, isConvexAuthenticated ? {} : "skip")

    // Determine profile: use Convex data if available, fallback to store
    const profile = React.useMemo(() => {
        if (user) return createProfileFromConvexUser(user)
        return storeProfile
    }, [user, storeProfile])

    // Effectively authenticated if Convex says so
    const isAuthenticated = isConvexAuthenticated

    // Sync to store when data arrives
    React.useEffect(() => {
        if (user) {
            setUserId(user._id)
            setProfile(createProfileFromConvexUser(user))
        }
    }, [user, setUserId, setProfile])

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center space-x-2">
                    <Image src="/logo/wifi-dark.png" alt="Echoray Logo" width={32} height={32} className="h-8 w-8 object-contain" />
                    <span className="text-xl font-bold tracking-tight">Echoray</span>
                </Link>

                <div className="hidden md:flex md:flex-1 md:justify-center">
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger className="bg-transparent">Services</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-linear-to-b from-primary/20 via-primary/10 to-transparent p-6 no-underline outline-none transition-all hover:from-primary/30 hover:via-primary/20 focus:shadow-md"
                                                    href="/services"
                                                >
                                                    <div className="mb-2 mt-4 text-xl font-bold">What do you need?</div>
                                                    <p className="text-sm leading-tight text-muted-foreground font-medium">
                                                        We build the digital tools your business needs to grow.
                                                    </p>
                                                    <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-primary">
                                                        View all services &rarr;
                                                    </div>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        {services.map((service) => (
                                            <ListItem key={service.title} title={service.title} href={service.href} icon={service.icon}>
                                                {service.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/work" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                                        Our Work
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link href="/about" className={cn(navigationMenuTriggerStyle(), "bg-transparent")}>
                                        About
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                <div className="flex items-center gap-2">
                    {isAuthenticated ? (
                        <>
                            <Button variant="ghost" asChild className="hidden md:inline-flex gap-2">
                                <Link href="/dashboard">
                                    {profile?.avatarUrl ? (
                                        <Image
                                            src={profile.avatarUrl}
                                            alt={profile.displayName || "User"}
                                            width={24}
                                            height={24}
                                            className="h-6 w-6 rounded-full"
                                        />
                                    ) : (
                                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                                            {profile?.displayName?.charAt(0) || profile?.email?.charAt(0) || "U"}
                                        </div>
                                    )}
                                    <span className="font-medium">{profile?.displayName?.split(' ')[0] || "Dashboard"}</span>
                                </Link>
                            </Button>
                        </>
                    ) : (
                        <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
                            <Link href="/auth/login">
                                <LogIn className="h-5 w-5" />
                                <span className="sr-only">Sign In</span>
                            </Link>
                        </Button>
                    )}

                    <Button asChild className="hidden sm:inline-flex">
                        <Link href="/start-project">Start Project</Link>
                    </Button>

                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="relative md:hidden h-10 w-10">
                                <div className="relative h-5 w-5">
                                    <span
                                        className={cn(
                                            "absolute left-0 top-1.5 h-0.5 w-5 bg-current transition-all duration-300",
                                            isOpen && "top-1/2 -translate-y-1/2 rotate-45"
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            "absolute left-0 bottom-1.5 h-0.5 w-5 bg-current transition-all duration-300",
                                            isOpen && "top-1/2 -translate-y-1/2 -rotate-45"
                                        )}
                                    />
                                </div>
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" hideClose overlayClassName="top-16 h-[calc(100vh-4rem)]" className="w-[300px] sm:w-[400px] mt-16 h-[calc(100vh-4rem)] border-l border-t-0 p-6 pt-8">
                            <nav className="flex flex-col gap-6">
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Services</h4>
                                    <div className="flex flex-col gap-1">
                                        {services.map((service) => (
                                            <Link key={service.title} href={service.href} className="py-2 text-base font-medium hover:text-primary transition-colors">
                                                {service.title}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <hr className="border-muted" />
                                <div className="flex flex-col gap-1">
                                    <Link href="/work" className="py-2 text-base font-medium hover:text-primary transition-colors">
                                        Our Work
                                    </Link>
                                    <Link href="/about" className="py-2 text-base font-medium hover:text-primary transition-colors">
                                        About
                                    </Link>
                                </div>
                                <hr className="border-muted" />
                                <div className="flex flex-col gap-1">
                                    {isAuthenticated ? (
                                        <Link href="/dashboard" className="py-2 text-base font-medium hover:text-primary flex items-center gap-3 transition-colors">
                                            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                                {profile?.displayName?.charAt(0) || "D"}
                                            </div>
                                            <span>Dashboard</span>
                                        </Link>
                                    ) : (
                                        <Link href="/auth/login" className="py-2 text-base font-medium hover:text-primary flex items-center gap-3 transition-colors">
                                            <LogIn className="h-5 w-5" />
                                            <span>Sign In</span>
                                        </Link>
                                    )}
                                </div>

                                <Button asChild className="mt-2 w-full">
                                    <Link href="/start-project">Start Project</Link>
                                </Button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }>(
    ({ className, title, children, icon, ...props }, ref) => {
        return (
            <li>
                <NavigationMenuLink asChild>
                    <a
                        ref={ref}
                        className={cn(
                            "group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            className
                        )}
                        {...props}
                    >
                        <div className="flex items-center gap-2">
                            {icon && <div className="text-primary transition-transform group-hover:scale-110">{icon}</div>}
                            <div className="text-sm font-semibold leading-none">{title}</div>
                        </div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
                    </a>
                </NavigationMenuLink>
            </li>
        )
    }
)
ListItem.displayName = "ListItem"
