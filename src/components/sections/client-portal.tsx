"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Check, LayoutDashboard, MessageSquare, CreditCard, FileText, BarChart3, Shield, Star } from "lucide-react"
import Image from "next/image"

const portalTabs = [
  {
    id: "dashboard",
    label: "Project Hub",
    icon: LayoutDashboard,
    title: "Your Command Center",
    description:
      "Access every detail of your project from one high-performance dashboard. Stay informed with real-time updates and direct access to all mission-critical assets.",
    features: [
      "Dynamic Milestone Tracking",
      "Real-time Phase Monitoring",
      "Synchronized Deliverables",
      "Responsive Access Anywhere",
    ],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "communication",
    label: "Team Sync",
    icon: MessageSquare,
    title: "Direct Team Access",
    description:
      "Bridge the gap between vision and execution. Communicate directly with our specialists, provide feedback on tasks, and maintain a complete decision history.",
    features: [
      "Unified Communication Stream",
      "Contextual Task Commenting",
      "Searchable Workspace History",
      "Instant Feedback Loops",
    ],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "payments",
    label: "Billing",
    icon: CreditCard,
    title: "Financial Transparency",
    description:
      "Complete control over your investment. Manage subscriptions, view detailed transaction history, and download tax-ready invoices with a single click.",
    features: [
      "Real-time Spend Analytics",
      "Automated Invoice Generation",
      "Global Payment Sovereignty",
      "Flexible Plan Management",
    ],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "files",
    label: "Workspaces",
    icon: FileText,
    title: "Asset Management",
    description:
      "An organized repository for all project documentation and brand assets. Full version control ensures you're always working with the latest iterations.",
    features: [
      "Enterprise File Governance",
      "Incremental Version History",
      "Secure Asset Distribution",
      "Phase-Based Organization",
    ],
    image: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "analytics",
    label: "Intelligence",
    icon: BarChart3,
    title: "Performance Insights",
    description:
      "Don't just launch—optimize. Integrated analytics provide deep insights into user behavior and platform performance helping you make data-driven decisions.",
    features: [
      "Advanced Visitor Telemetry",
      "Conversion Funnel Analysis",
      "UX Performance Metrics",
      "Custom Intelligence Reports",
    ],
    image: "/placeholder.svg?height=400&width=600",
  },
]

export function ClientPortal() {
  const [activeTab, setActiveTab] = useState(portalTabs[0])

  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 blur-[160px] rounded-full" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary py-1 px-4">
              Client Experience
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6">
              Full Visibility via <span className="text-primary italic">Operational Dashboards</span>
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-muted-foreground">
              A premium, all-in-one workspace designed to keep your projects transparent, organized, and moving at the speed of business.
            </p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Horizontal Navigation */}
          <div className="mb-8 flex flex-wrap justify-center gap-2 p-2 rounded-3xl bg-card/30 backdrop-blur-md border border-muted/50 w-fit mx-auto">
            {portalTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab.id === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 relative group ${isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-primary group-hover:scale-110 transition-transform"}`} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="portal-active-pill"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="relative group">
            {/* Decorative Window frame */}
            <div className="absolute -inset-0.5 bg-linear-to-r from-primary/30 to-purple-500/30 rounded-[32px] blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative bg-card/80 backdrop-blur-xl border border-muted/50 rounded-[30px] overflow-hidden shadow-2xl">
              {/* Window Controls */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-muted/50 bg-muted/30">
                <div className="flex gap-1.5 line-item">
                  <div className="w-3 h-3 rounded-full bg-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                  <div className="w-3 h-3 rounded-full bg-green-500/30" />
                </div>
                <div className="hidden md:flex px-4 py-1 rounded-full bg-background/50 border border-muted/50 text-[10px] text-muted-foreground font-mono">
                  dashboards.echoray.io/project-active
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center">
                        <span className="text-[8px] font-bold">U{i}</span>
                      </div>
                    ))}
                  </div>
                  <Star className="h-3.5 w-3.5 text-yellow-500/50 fill-yellow-500/20" />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="p-8 md:p-12"
                >
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <activeTab.icon className="h-5 w-5 text-primary" />
                          <span className="text-xs font-bold uppercase tracking-widest text-primary/80">Dashboard View</span>
                        </div>
                        <h3 className="text-3xl font-bold tracking-tight">
                          {activeTab.title}
                        </h3>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                          {activeTab.description}
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {activeTab.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-6 flex items-center gap-4">
                        <button className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transition-all">
                          Open Dashboard
                        </button>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          Enterprise Security Enabled
                        </div>
                      </div>
                    </div>

                    <motion.div
                      className="relative aspect-4/3 rounded-2xl overflow-hidden border border-muted/50 shadow-inner group/preview"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="absolute inset-0 bg-linear-to-tr from-primary/5 to-transparent z-10 pointer-events-none" />
                      <Image
                        src={activeTab.image}
                        alt={activeTab.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover/preview:scale-110"
                      />
                      {/* Overlay elements for data-feel */}
                      <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
                        <div className="p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/70">
                          AUTO_REFRESH: ON // 60ms
                        </div>
                        <div className="px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-bold text-primary">
                          LIVE DATA
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
