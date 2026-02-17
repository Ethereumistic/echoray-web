"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowRight, Star, X, Sparkles, Crown, Zap } from "lucide-react"
import { Button } from "@echoray/ui/components/ui/button"
import Link from "next/link"
import { useState, useRef, useEffect } from "react"

const planIcons = {
    "Simple Website": Zap,
    "Advanced Website": Star,
    "Custom System": Crown,
}

const plans = [
    {
        name: "Simple Website",
        price: "€99",
        setup: "€0 setup",
        description: "Get online and start growing",
        bestFor: "Perfect for: Personal brands, freelancers, local businesses",
        features: [
            { text: "Beautiful custom design", included: true },
            { text: "Mobile-responsive", included: true },
            { text: "Easy content updates", included: true },
            { text: "Hosting & SSL included", included: true },
            { text: "Email support", included: true },
            { text: "Online store", included: false },
            { text: "User accounts", included: false },
        ],
        cta: "Start for €99/month",
        href: "/start-project",
    },
    {
        name: "Advanced Website",
        price: "€299",
        setup: "€0 setup",
        description: "Sell online and grow faster",
        bestFor: "Perfect for: E-commerce, service businesses, growing companies",
        popular: true,
        features: [
            { text: "Everything in Simple", included: true },
            { text: "Online store with payments", included: true },
            { text: "Customer accounts", included: true },
            { text: "Booking/appointment system", included: true },
            { text: "Priority support", included: true },
            { text: "Advanced integrations", included: true },
            { text: "Custom automations", included: false },
        ],
        cta: "Start for €299/month",
        href: "/start-project",
    },
    {
        name: "Custom System",
        price: "Custom",
        setup: "Quoted per project",
        description: "Built exactly for your needs",
        bestFor: "Perfect for: Complex workflows, large teams, unique requirements",
        features: [
            { text: "Everything in Advanced", included: true },
            { text: "Custom development", included: true },
            { text: "CRM & dashboards", included: true },
            { text: "Team collaboration", included: true },
            { text: "API integrations", included: true },
            { text: "Dedicated support", included: true },
            { text: "SLA agreement", included: true },
        ],
        cta: "Get a Quote",
        href: "/contact",
    },
]

function PricingCard({
    plan,
    index,
    hoveredCard,
    setHoveredCard
}: {
    plan: typeof plans[0]
    index: number
    hoveredCard: string | null
    setHoveredCard: (name: string | null) => void
}) {
    const cardRef = useRef<HTMLDivElement>(null)
    const IconComponent = planIcons[plan.name as keyof typeof planIcons]

    const glareState = useRef({
        glare: { x: 50, y: 50 },
        background: { x: 50, y: 50 },
    })

    const updateGlareStyles = () => {
        if (cardRef.current) {
            const { glare, background } = glareState.current
            cardRef.current.style.setProperty("--glare-x", `${glare.x}%`)
            cardRef.current.style.setProperty("--glare-y", `${glare.y}%`)
            cardRef.current.style.setProperty("--bg-x", `${background.x}%`)
            cardRef.current.style.setProperty("--bg-y", `${background.y}%`)
        }
    }

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
        const percentage = {
            x: (100 / rect.width) * position.x,
            y: (100 / rect.height) * position.y,
        }

        glareState.current.glare.x = percentage.x
        glareState.current.glare.y = percentage.y
        glareState.current.background.x = 50 + percentage.x / 4 - 12.5
        glareState.current.background.y = 50 + percentage.y / 3 - 16.67

        updateGlareStyles()
    }

    const handlePointerEnter = () => {
        if (cardRef.current) {
            cardRef.current.style.setProperty("--glare-opacity", "0.08")
        }
    }

    const handlePointerLeave = () => {
        if (cardRef.current) {
            cardRef.current.style.setProperty("--glare-opacity", "0")
        }
    }

    return (
        <div
            ref={cardRef}
            style={
                plan.popular
                    ? ({
                        "--glare-x": "50%",
                        "--glare-y": "50%",
                        "--bg-x": "50%",
                        "--bg-y": "50%",
                        "--glare-opacity": "0",
                    } as React.CSSProperties)
                    : undefined
            }
            className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${plan.popular
                ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                : "bg-card border border-border hover:border-primary/30"
                }`}
            onMouseEnter={() => setHoveredCard(plan.name)}
            onMouseLeave={() => setHoveredCard(null)}
            onPointerMove={plan.popular ? handlePointerMove : undefined}
            onPointerEnter={plan.popular ? handlePointerEnter : undefined}
            onPointerLeave={plan.popular ? handlePointerLeave : undefined}
        >
            {plan.popular && (
                <>
                    <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
                        <div
                            className="absolute inset-0 opacity-[var(--glare-opacity)] transition-opacity duration-300 mix-blend-soft-light"
                            style={{
                                background:
                                    "radial-gradient(farthest-corner circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.16) 10%, rgba(255,255,255,0.13) 20%, rgba(255,255,255,0) 90%)",
                            }}
                        />
                    </div>
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0 opacity-[var(--glare-opacity)] transition-opacity duration-300 mix-blend-color-dodge"
                        style={{
                            background: `var(--pattern), var(--rainbow), var(--diagonal), var(--shade)`,
                            backgroundBlendMode: "hue, hue, hue, overlay",
                            ["--step" as string]: "5%",
                            ["--pattern" as string]: `url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.99994 3.419 21.6142 7.43646 22.7921 12.153C23.97 16.8695 3.41838 23.0306 3.41838 23.0306' stroke='white' stroke-width='5' stroke-miterlimit='3.86874' stroke-linecap='round' style='mix-blend-mode:darken'/%3E%3C/svg%3E") center/100% no-repeat`,
                            ["--rainbow" as string]:
                                "repeating-linear-gradient(0deg, rgb(255,119,115) calc(var(--step) * 1), rgba(255,237,95,1) calc(var(--step) * 2), rgba(168,255,95,1) calc(var(--step) * 3), rgba(131,255,247,1) calc(var(--step) * 4), rgba(120,148,255,1) calc(var(--step) * 5), rgb(216,117,255) calc(var(--step) * 6), rgb(255,119,115) calc(var(--step) * 7)) 0% var(--bg-y)/200% 700% no-repeat",
                            ["--diagonal" as string]:
                                "repeating-linear-gradient(128deg, #0e152e 0%, hsl(180,10%,60%) 3.8%, hsl(180,10%,60%) 4.5%, hsl(180,10%,60%) 5.2%, #0e152e 10%, #0e152e 12%) var(--bg-x) var(--bg-y)/300% no-repeat",
                            ["--shade" as string]:
                                "radial-gradient(farthest-corner circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.02) 12%, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.05) 120%) var(--bg-x) var(--bg-y)/300% no-repeat",
                        } as React.CSSProperties}
                    />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-background text-sm font-bold rounded-full shadow-lg">
                            <Star className="w-3 h-3" />
                            Best Value
                        </span>
                    </div>
                </>
            )}

            {!plan.popular && (
                <>
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(rgba(120,119,198,0.03) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(120,119,198,0.03) 1px, transparent 1px)
                            `,
                            backgroundSize: "32px 32px",
                        }}
                    />

                    {plan.name === "Simple Website" && (
                        <AnimatePresence>
                            {hoveredCard === plan.name && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className="absolute inset-0 w-[200%] h-[200%]"
                                        initial={{ x: "-50%", y: "-50%" }}
                                        animate={{ x: "50%", y: "50%" }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        style={{
                                            background: "linear-gradient(135deg, transparent 0%, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%, transparent 100%)",
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    {plan.name === "Custom System" && (
                        <AnimatePresence>
                            {hoveredCard === plan.name && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <motion.div
                                        className="absolute w-[200%] h-[200%] -right-[100%] -top-[100%]"
                                        initial={{ x: "0%", y: "0%" }}
                                        animate={{ x: "-100%", y: "100%" }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        style={{
                                            background: "linear-gradient(-135deg, transparent 0%, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%, transparent 100%)",
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}

                    <AnimatePresence>
                        {hoveredCard === plan.name && (
                            <motion.div
                                className="absolute -inset-px rounded-2xl pointer-events-none z-0"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    background: "radial-gradient(400px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(120, 119, 198, 0.06), transparent 60%)",
                                }}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}

            <div className="relative z-10">
                <motion.div
                    className="mb-6"
                    initial={false}
                    animate={{ y: hoveredCard === plan.name ? -2 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${plan.popular ? "bg-white/10" : "bg-primary/10"}`}>
                            <IconComponent className={`w-4 h-4 ${plan.popular ? "text-white" : "text-primary"}`} />
                        </div>
                        <h3 className={`text-lg font-bold ${plan.popular ? "" : "text-foreground"}`}>
                            {plan.name}
                        </h3>
                    </div>
                    <p className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {plan.description}
                    </p>
                </motion.div>

                <motion.div
                    className="mb-6"
                    initial={false}
                    animate={{ y: hoveredCard === plan.name ? -2 : 0 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                >
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.price !== "Custom" && (
                            <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                                /month
                            </span>
                        )}
                    </div>
                    <p className={`text-sm mt-1 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {plan.setup}
                    </p>
                </motion.div>

                <motion.ul
                    className="space-y-3 mb-8"
                    initial={false}
                    animate={{ y: hoveredCard === plan.name ? -2 : 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                >
                    {plan.features.map((feature) => (
                        <li
                            key={feature.text}
                            className={`flex items-center gap-2 text-sm ${!feature.included
                                ? plan.popular
                                    ? "text-primary-foreground/40"
                                    : "text-muted-foreground/50"
                                : ""
                                }`}
                        >
                            {feature.included ? (
                                <Check className={`w-4 h-4 shrink-0 ${plan.popular ? "text-chart-1" : "text-chart-1"}`} />
                            ) : (
                                <X className={`w-4 h-4 shrink-0 ${plan.popular ? "text-primary-foreground/30" : "text-destructive/50"}`} />
                            )}
                            <span className={!feature.included ? "line-through" : ""}>
                                {feature.text}
                            </span>
                        </li>
                    ))}
                </motion.ul>

                <motion.p
                    className={`text-xs mb-6 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                    initial={false}
                    animate={{ y: hoveredCard === plan.name ? -2 : 0 }}
                    transition={{ duration: 0.2, delay: 0.15 }}
                >
                    {plan.bestFor}
                </motion.p>

                <Button
                    className={`w-full font-semibold group ${plan.popular
                        ? "bg-background text-foreground hover:bg-background/90"
                        : ""
                        }`}
                    variant={plan.popular ? "secondary" : "default"}
                    asChild
                >
                    <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export function Pricing5() {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null)
    const headerRef = useRef<HTMLDivElement>(null)
    const oneTimeCardRef = useRef<HTMLDivElement>(null)
    const oneTimeGlareState = useRef({
        glare: { x: 50, y: 50 },
        background: { x: 50, y: 50 },
    })

    const updateOneTimeGlareStyles = () => {
        if (oneTimeCardRef.current) {
            const { glare, background } = oneTimeGlareState.current
            oneTimeCardRef.current.style.setProperty("--glare-x", `${glare.x}%`)
            oneTimeCardRef.current.style.setProperty("--glare-y", `${glare.y}%`)
            oneTimeCardRef.current.style.setProperty("--bg-x", `${background.x}%`)
            oneTimeCardRef.current.style.setProperty("--bg-y", `${background.y}%`)
        }
    }

    const handleOneTimeCardPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
        const percentage = {
            x: (100 / rect.width) * position.x,
            y: (100 / rect.height) * position.y,
        }

        oneTimeGlareState.current.glare.x = percentage.x
        oneTimeGlareState.current.glare.y = percentage.y
        oneTimeGlareState.current.background.x = 50 + percentage.x / 4 - 12.5
        oneTimeGlareState.current.background.y = 50 + percentage.y / 3 - 16.67

        updateOneTimeGlareStyles()
    }

    const handleOneTimeCardPointerEnter = () => {
        if (oneTimeCardRef.current) {
            oneTimeCardRef.current.style.setProperty("--glare-opacity", "0.08")
        }
    }

    const handleOneTimeCardPointerLeave = () => {
        if (oneTimeCardRef.current) {
            oneTimeCardRef.current.style.setProperty("--glare-opacity", "0")
        }
    }

    return (
        <section id="pricing" className="py-16 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6">
                <div
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight mb-4">
                        Choose your plan
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        No hidden fees. No contracts. Cancel anytime.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <PricingCard
                            key={plan.name}
                            plan={plan}
                            index={index}
                            hoveredCard={hoveredCard}
                            setHoveredCard={setHoveredCard}
                        />
                    ))}
                </div>

                <div
                    className="max-w-3xl mx-auto mt-12 relative overflow-hidden bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                    style={{
                        "--glare-x": "50%",
                        "--glare-y": "50%",
                        "--bg-x": "50%",
                        "--bg-y": "50%",
                        "--glare-opacity": "0",
                    } as React.CSSProperties}
                    ref={oneTimeCardRef}
                    onMouseEnter={() => setHoveredCard("one-time")}
                    onMouseLeave={() => setHoveredCard(null)}
                    onPointerMove={handleOneTimeCardPointerMove}
                    onPointerEnter={handleOneTimeCardPointerEnter}
                    onPointerLeave={handleOneTimeCardPointerLeave}
                >
                    <div className="absolute inset-0 rounded-2xl" />
                    <div className="absolute inset-0 rounded-2xl border border-primary/20" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                    <div
                        className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0 opacity-[var(--glare-opacity)] transition-opacity duration-300 mix-blend-color-dodge"
                        style={{
                            background: `var(--pattern), var(--rainbow), var(--diagonal), var(--shade)`,
                            backgroundBlendMode: "hue, hue, hue, overlay",
                            ["--step" as string]: "5%",
                            ["--pattern" as string]: `url("data:image/svg+xml,%3Csvg width='26' height='26' viewBox='0 0 26 26' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.99994 3.419C2.99994 3.419 21.6142 7.43646 22.7921 12.153C23.97 16.8695 3.41838 23.0306 3.41838 23.0306' stroke='white' stroke-width='5' stroke-miterlimit='3.86874' stroke-linecap='round' style='mix-blend-mode:darken'/%3E%3C/svg%3E") center/100% no-repeat`,
                            ["--rainbow" as string]:
                                "repeating-linear-gradient(0deg, rgb(255,119,115) calc(var(--step) * 1), rgba(255,237,95,1) calc(var(--step) * 2), rgba(168,255,95,1) calc(var(--step) * 3), rgba(131,255,247,1) calc(var(--step) * 4), rgba(120,148,255,1) calc(var(--step) * 5), rgb(216,117,255) calc(var(--step) * 6), rgb(255,119,115) calc(var(--step) * 7)) 0% var(--bg-y)/200% 700% no-repeat",
                            ["--diagonal" as string]:
                                "repeating-linear-gradient(128deg, #0e152e 0%, hsl(180,10%,60%) 3.8%, hsl(180,10%,60%) 4.5%, hsl(180,10%,60%) 5.2%, #0e152e 10%, #0e152e 12%) var(--bg-x) var(--bg-y)/300% no-repeat",
                            ["--shade" as string]:
                                "radial-gradient(farthest-corner circle at var(--glare-x) var(--glare-y), rgba(255,255,255,0.02) 12%, rgba(255,255,255,0.03) 20%, rgba(255,255,255,0.05) 120%) var(--bg-x) var(--bg-y)/300% no-repeat",
                        } as React.CSSProperties}
                    />

                    <div className="relative p-6 md:p-8 rounded-2xl text-center border-3 border-primary/30 hover:border-primary/80 transition-all duration-300 border-dotted">
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>One-Time Option</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">
                            Want full ownership with no monthly commitment?
                        </h3>
                        <p className="text-muted-foreground mb-5 max-w-lg mx-auto">
                            Get a custom-built website you own outright. Pay once, keep it forever.
                            Perfect if you prefer capital expenses over subscriptions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button variant="outline" size="sm" asChild className="border-primary/30 hover:bg-primary/5">
                                <Link href="/contact">
                                    Get a Quote
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
