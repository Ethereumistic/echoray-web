"use client"

import { Check, Zap, Database, DollarSign, Wifi, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const plans = [
  {
    name: "Web",
    price: "€99",
    description: "Perfect for small businesses looking for a premium online presence.",
    features: [
      "Company & Business Sites",
      "Professional Portfolios",
      "Landing & Sales Pages",
      "Easy Content Manager (CMS)",
      "Domain & Hosting Setup",
    ],
    cta: "Subscribe Now",
    href: "/start-project",
    highlight: false,
    icon: <Wifi className="h-24 w-24" />,
  },
  {
    name: "App",
    price: "€299",
    description: "Advanced tools and portals for businesses with unique needs.",
    features: [
      "Everything in Web",
      "E-commerce Storefronts",
      "Secure User Accounts",
      "SaaS Product Development",
      "Booking & Payment Systems",
    ],
    cta: "Subscribe Now",
    href: "/start-project",
    highlight: true,
    icon: <ShoppingCart className="h-24 w-24" />,
  },
  {
    name: "CRM",
    price: "Custom",
    description: "Custom CRM and management systems for complex operations. Custom deal pricing tailored to your business needs.",
    features: [
      "Everything in App",
      "Custom CRM Development",
      "User Management",
      "Data Security",
      "Custom Integration",
    ],
    cta: "Book a Strategy Call",
    href: "/contact",
    highlight: false,
    icon: <Database className="h-24 w-24" />,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-24 md:py-32">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance">
          Clear Pricing, <span className="text-primary">No Surprises</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
          Choose the path that fits your current goals. All plans include our premium quality and ongoing support.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col border-muted/50 transition-all hover:border-primary/50 hover:shadow-2xl group ${plan.highlight ? "border-primary/50 shadow-lg shadow-primary/5" : ""}`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                <div className="absolute top-4 right-4 text-primary/5 transition-colors group-hover:text-primary/10">
                  {plan.icon}
                </div>
              </div>

              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40">
                  <Badge className="px-4 py-1.5 text-sm font-bold uppercase tracking-wider shadow-xl border-primary bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="relative z-10 pt-10">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-4 text-base leading-relaxed text-pretty">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 relative z-10">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 relative z-10">
                <Button size="lg" className="w-full font-bold" asChild>
                  <Link href={plan.href}>
                    <Zap className="mr-2 h-4 w-4" />
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>



        <Card className="border-primary/30 bg-linear-to-br from-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Prefer a one-time payment?</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Get a professional website without monthly commitments. Ideal if you are looking for a one-time
                  service - a completely turnkey web solution, without monthly commitments. You pay once, we take care
                  of everything - from design to publishing.
                </p>
              </div>
              <Button size="lg" variant="outline" className="font-bold whitespace-nowrap bg-transparent" asChild>
                <Link href="/contact">Let us plan your project</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
