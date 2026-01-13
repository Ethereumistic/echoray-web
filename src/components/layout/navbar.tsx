"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Globe, Terminal, Settings2, LogIn } from "lucide-react"

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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

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
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <Image src="/logo/logo.png" alt="Echoray Logo" width={32} height={32} className="h-8 w-8 object-contain" />
                    <span className="text-xl font-bold tracking-tight">Echoray</span>
                </Link>

                <div className="hidden md:flex md:flex-1">
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
                    <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
                        <a target="_blank" href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}>
                            <LogIn className="h-5 w-5" />
                            <span className="sr-only">Sign In</span>
                        </a>
                    </Button>

                    <Button asChild className="hidden sm:inline-flex">
                        <Link href="/start-project">Start Project</Link>
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <Image src="/logo/logo.png" alt="Echoray Logo" width={24} height={24} />
                                    <span>Echoray</span>
                                </SheetTitle>
                            </SheetHeader>
                            <nav className="mt-8 flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <h4 className="text-sm font-medium text-muted-foreground">Services</h4>
                                    {services.map((service) => (
                                        <Link key={service.title} href={service.href} className="text-lg font-medium hover:text-primary">
                                            {service.title}
                                        </Link>
                                    ))}
                                </div>
                                <hr className="my-2 border-muted" />
                                <Link href="/work" className="text-lg font-medium hover:text-primary">
                                    Our Work
                                </Link>
                                <Link href="/about" className="text-lg font-medium hover:text-primary">
                                    About
                                </Link>
                                <a href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"} className="text-lg font-medium hover:text-primary flex items-center gap-2">
                                    <LogIn className="h-5 w-5" />
                                    <span>App</span>
                                </a>

                                <Button asChild className="mt-4 w-full">
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
