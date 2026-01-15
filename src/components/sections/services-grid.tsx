"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Database, Check, Wifi } from "lucide-react"
import Link from "next/link"

const services = [
    {
        icon: <Wifi className="h-10 w-10" />,
        question: "I need a professional website",
        description: "Fast, beautiful, and built to find you customers. We bridge the gap between your brand and the web.",
        features: ["Business Websites", "Company Portfolios", "Landing Pages", "Personal Branding"],
        cta: "See Pricing",
        href: "#pricing",
        variant: "default" as const
    },
    {
        icon: <ShoppingCart className="h-10 w-10" />,
        question: "I need a tool for my users",
        description: "Custom dashboards and web apps that solve actual problems. Complex logic delivered simply.",
        features: ["E-commerce Solutions", "User Portals", "SaaS Platforms", "Booking Systems"],
        cta: "See Pricing",
        href: "#pricing",
        variant: "primary" as const
    },
    {
        icon: <Database className="h-10 w-10" />,
        question: "I need to manage my business",
        description: "Custom systems and CRMs that automate your work. We build the backbone of your operations.",
        features: ["Customer Management (CRM)", "Internal Tools", "Inventory Systems", "Business Automation"],
        cta: "See Pricing",
        href: "#pricing",
        variant: "default" as const
    }
]

export function ServicesGrid() {
    return (
        <section id="services-grid" className="container mx-auto px-4 py-24 md:py-32">
            <div className="mb-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                    What can we build for you?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                    Direct answers for your digital needs. No jargon, just results.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                    <Card key={index} className="flex flex-col border-muted/50 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5">
                        <CardHeader>
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                {service.icon}
                            </div>
                            <CardTitle className="text-2xl">{service.question}</CardTitle>
                            <CardDescription className="text-base leading-relaxed">
                                {service.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3">
                                {service.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Check className="h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button size="lg" className="w-full" variant={service.variant === "primary" ? "default" : "outline"} asChild>
                                <a href={service.href}>{service.cta}</a>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>


            <div className="mt-16 text-center">
                <p className="text-muted-foreground">
                    Not sure what you need?{" "}
                    <Link href="/contact" className="font-medium text-primary hover:underline">
                        Talk to our guide &rarr;
                    </Link>
                </p>
            </div>
        </section>
    )
}
