"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Globe, Layout, Database, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const services = [
  {
    id: "web",
    title: "Web Solutions",
    icon: Globe,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "group-hover:border-blue-500/50",
    tabs: [
      {
        id: "new-website",
        label: "Strategic Web Presence",
        title: "Websites Built for Conversion",
        description:
          "We don't just build websites; we create digital experiences that serve your business goals. From rapid 7-day turnarounds to complex enterprise sites.",
        features: [
          "Conversion-Optimized Architecture",
          "Custom Brand-First Design",
          "High-Performance Architecture",
          "Seamless CMS Integration",
        ],
        image: "/placeholder.svg?height=400&width=600",
      },
      {
        id: "redesign",
        label: "Digital Evolution",
        title: "Modernize Your Experience",
        description:
          "Breathe new life into your existing platform. We analyze performance gaps and implement modern design systems that drive measurable growth.",
        features: ["Comprehensive Design Audit", "Speed & Performance Overhaul", "Modern Tech Stack Migration", "Mobile-First Optimization"],
        image: "/placeholder.svg?height=400&width=600",
      },
    ],
    includedBadge: null,
  },
  {
    id: "app",
    title: "Application Development",
    icon: Layout,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "group-hover:border-purple-500/50",
    tabs: [
      {
        id: "saas",
        label: "SaaS & Products",
        title: "Innovative Software Products",
        description:
          "Transform your vision into a scalable product. We build robust web applications with complex logic and intuitive user interfaces.",
        features: [
          "Scalable Infrastructure",
          "Advanced User Authentication",
          "Real-time Data Processing",
          "Custom API Development",
        ],
        image: "/placeholder.svg?height=400&width=600",
      },
      {
        id: "payments",
        label: "Monetization",
        title: "Secure Payment Ecosystems",
        description:
          "Turn your platform into a revenue engine. We integrate secure, global payment systems that handle subscriptions and transactions flawlessly.",
        features: ["Stripe & Global Gateway Integrations", "Subscription Lifecycle Management", "Automated Invoicing", "Fraud Prevention Systems"],
        image: "/placeholder.svg?height=400&width=600",
      },
    ],
    includedBadge: "Everything in Web +",
  },
  {
    id: "crm",
    title: "Business Automation",
    icon: Database,
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "group-hover:border-amber-500/50",
    tabs: [
      {
        id: "internal-tools",
        label: "Internal Ecosystems",
        title: "Custom CRM & Internal Tools",
        description:
          "Eliminate operational bottlenecks with custom-built tools designed specifically for your team's workflow and data needs.",
        features: [
          "Custom CRM Development",
          "Intelligent Workflow Automation",
          "Data Visualization Dashboards",
          "Enterprise System Integration",
        ],
        image: "/placeholder.svg?height=400&width=600",
      },
      {
        id: "efficiency",
        label: "Operational Excellence",
        title: "Automate the Mundane",
        description:
          "Stop wasting time on repetitive tasks. We build intelligent systems that handle the busy work so you can focus on growth.",
        features: ["Cross-Platform Automations", "Intelligent Notification Systems", "Legacy System Modernization", "Process Documentation"],
        image: "/placeholder.svg?height=400&width=600",
      },
    ],
    includedBadge: "Full-Stack Control",
  },
]

export function ServicesCarousel() {
  const [activeService, setActiveService] = useState(services[0])

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-linear-to-b ${activeService.color} blur-[120px] rounded-full transition-colors duration-1000`} />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary py-1 px-4">
              Our Expertise
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Solutions Designed to <span className="text-primary">Scale</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              We don&apos;t just build features; we build long-term value for your business through technical excellence and strategic design.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col gap-12">
          {/* Service Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => {
              const Icon = service.icon
              const isActive = activeService.id === service.id
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveService(service)}
                  className={`group relative flex items-center gap-4 p-6 rounded-2xl border transition-all duration-300 text-left ${isActive
                    ? "bg-card border-primary/50 shadow-lg shadow-primary/5 scale-[1.02]"
                    : "bg-background/40 border-muted hover:border-muted-foreground/30"
                    }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className={`font-bold transition-colors ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {service.title}
                    </h3>
                    {service.includedBadge && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {service.includedBadge}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Service Details Tabs */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-card/50 backdrop-blur-sm border border-muted/50 rounded-3xl p-6 md:p-12 overflow-hidden"
            >
              <Tabs defaultValue={activeService.tabs[0].id} className="w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
                    {activeService.tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="rounded-lg py-2.5 px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <Button variant="link" className="text-primary group px-0">
                    Learn more about {activeService.title} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>

                {activeService.tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="mt-0 focus-visible:outline-none">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-3xl font-bold mb-4 bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            {tab.title}
                          </h4>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {tab.description}
                          </p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {tab.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-muted/50">
                              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Check className="h-3 w-3" />
                              </div>
                              <span className="text-sm font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-4">
                          <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                            Book a Strategy Call
                          </Button>
                        </div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative aspect-4/3 rounded-3xl overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-transparent z-10" />
                        <div className="absolute inset-0 border border-white/10 rounded-3xl z-20" />
                        <Image
                          src={tab.image || "/placeholder.svg"}
                          alt={tab.title}
                          fill
                          className="object-cover transform transition-transform duration-700 hover:scale-110"
                        />
                        {/* Decorative UI elements to make it look like a real app */}
                        <div className="absolute top-4 right-4 z-30 flex gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500/50" />
                          <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
                          <div className="h-2 w-2 rounded-full bg-green-500/50" />
                        </div>
                      </motion.div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
