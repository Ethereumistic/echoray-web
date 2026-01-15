"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-12 md:p-16 text-center">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-balance mb-4">
            Get your website today
          </h2>
          <p className="text-xl text-muted-foreground mb-2">No risk. No high costs.</p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with a monthly subscription and get a website, logo, hosting and everything you need - no contracts
            and no hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="h-14 px-8 text-lg">
              <Link href="/start-project">
                Let us plan your project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg bg-transparent">
              <Link href="/contact">Book a consultation</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
