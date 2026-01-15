"use client"

import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const included = [
  "Customized web design that brings results",
  "Free logo design and brand documentation",
  "Stable hosting with domain and technical support",
  "SSL certificate and attack protection",
  "Basic SEO optimization",
  "Premium plugins and tools",
  "Content management system",
  "Regular support and monthly updates",
]

const notIncluded = [
  "High initial costs",
  "Months of waiting and confusing deadlines",
  "Overpriced and overloaded packages",
  "Long-term contracts",
  "Slow or morally outdated sites",
  "Lack of support and responsibility",
  "DIY builders that waste your time",
  "Hidden fees and unpleasant surprises",
]

export function WhatsIncluded() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="mb-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
          Convenient, fast, easy and affordable
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">What do you get?</h2>
        <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground leading-relaxed">
          Every website we create comes with premium usability, focused on real results - better online usability, more
          trust and more customers.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              You will get:
            </h3>
            <ul className="space-y-4">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-muted/50 bg-muted/5">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <X className="h-5 w-5 text-muted-foreground" />
              </div>
              You will not get:
            </h3>
            <ul className="space-y-4">
              {notIncluded.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed line-through decoration-muted-foreground/30">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
