"use client"

import { MessageSquare, ClipboardList, Route, CreditCard, FileText, Rocket } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    title: "Consultation",
    description: "We conduct a short consultation to understand your business, needs and goals.",
  },
  {
    icon: ClipboardList,
    title: "We collect requirements",
    description: "We specify what exactly you need - functionalities, design, content.",
  },
  {
    icon: Route,
    title: "Guidance for the right plan",
    description: "We help you choose the most suitable subscription plan according to your goals.",
  },
  {
    icon: CreditCard,
    title: "You subscribe",
    description: "You start with the selected monthly plan - without contracts and hidden fees.",
  },
  {
    icon: FileText,
    title: "You send content",
    description: "You provide texts, images and other basic information.",
  },
  {
    icon: Rocket,
    title: "You are online and growing your business",
    description:
      "We finalize the site, optimize it for speed, SEO and security - you are ready to grow confidently online!",
  },
]

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-24 md:py-32">
      <div className="mb-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-4">
          Simple, clear and without unnecessary delay
        </p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">How does it work?</h2>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-start">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="absolute top-0 right-0 text-7xl font-bold text-primary/5">{index + 1}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
