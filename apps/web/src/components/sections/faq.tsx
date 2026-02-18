"use client"

import { motion, animate } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@echoray/ui/components/ui/accordion"
import { MessageCircle, ArrowRight, HelpCircle, Phone, Mail, Copy } from "lucide-react"
import { useRef } from "react"
import { Button } from "@echoray/ui/components/ui/button"
import { ButtonGroup } from "@echoray/ui/components/ui/button-group"
import { toast } from "sonner"

// Customize your scroll settings here
const SCROLL_OFFSET_REM = -65; // Value in REM. Negative values scroll further down, positive values stop earlier
const SCROLL_DURATION = 3; // Duration in seconds

const faqs = [
    {
        q: "What exactly do I get for €99/month?",
        a: "A professionally designed website, mobile-friendly, with hosting, security, and support all included. You also get a simple content manager to update text and images yourself. No extra fees.",
    },
    {
        q: "How fast can my website be ready?",
        a: "Most websites launch within 7 business days. More complex projects take 2-4 weeks. We'll give you a realistic timeline before starting.",
    },
    {
        q: "What if I need to cancel?",
        a: "No problem. Cancel anytime with no penalties. Your website stays online — you just won't receive updates or support anymore.",
    },
    {
        q: "Is there a contract or commitment?",
        a: "No contracts. It's month-to-month. If you want to stop, just let us know before your next billing date.",
    },
    {
        q: "Can I switch plans later?",
        a: "Yes, upgrade or downgrade anytime. The change takes effect immediately and we prorate your billing.",
    },
    {
        q: "Do you offer one-time payments?",
        a: "Yes. If you prefer to own your website outright without monthly fees, we offer one-time payment options. Contact us for a quote.",
    },
]

export function FAQ5() {
    const sectionRef = useRef<HTMLElement>(null)
    const scrollToNext = () => {
        const nextSection = sectionRef.current?.nextElementSibling as HTMLElement;
        if (nextSection) {
            const currentScroll = window.scrollY;
            const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            const offsetPx = SCROLL_OFFSET_REM * rootFontSize;
            const targetScroll = nextSection.getBoundingClientRect().top + currentScroll - offsetPx;

            // Helper to block user scrolling
            const preventDefault = (e: Event) => e.preventDefault();
            const preventKeys = (e: KeyboardEvent) => {
                if (["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "End", "Home"].includes(e.code)) {
                    e.preventDefault();
                }
            };

            // Add listeners to block scroll
            window.addEventListener("wheel", preventDefault, { passive: false });
            window.addEventListener("touchmove", preventDefault, { passive: false });
            window.addEventListener("keydown", preventKeys, { passive: false });

            animate(currentScroll, targetScroll, {
                duration: SCROLL_DURATION,
                ease: [0.16, 1, 0.3, 1], // Premium smooth easing
                onUpdate: (value) => window.scrollTo(0, value),
                onComplete: () => {
                    // Cleanup: allow scrolling again
                    window.removeEventListener("wheel", preventDefault);
                    window.removeEventListener("touchmove", preventDefault);
                    window.removeEventListener("keydown", preventKeys);
                }
            });
        }
    }

    return (
        <section ref={sectionRef} className="py-24 overflow-hidden relative">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Centered Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-6xl font-black text-foreground mb-6 leading-[1.1] tracking-tight">
                        Got Questions?<br />
                        We have <span className="text-primary ">Answers</span>
                    </h2>
                    <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                        Everything you need to know about our process, pricing, and how we help you scale your digital presence.
                    </p>
                </motion.div>


                <div className="flex flex-col xl:grid xl:grid-cols-[1fr_1.5fr] gap-12 xl:gap-24 items-start max-w-7xl mx-auto">
                    {/* Left column - Help Card (Moves to bottom on mobile) */}
                    <div className="xl:sticky xl:top-32 w-full order-2 xl:order-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            whileHover={{ y: -5, transition: { duration: 0.3 } }}
                            className="relative group p-8 md:p-10 rounded-[2.5rem] border border-primary/10 bg-linear-to-br from-card/80 to-muted/50 backdrop-blur-2xl overflow-hidden shadow-2xl shadow-primary/5"
                        >
                            {/* Animated Background Element */}
                            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase text-emerald-500 mb-6 bg-emerald-500/10 w-fit px-3 py-1 rounded-full ring-1 ring-emerald-500/20">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Free Consultation
                                </div>

                                <div className="flex items-center gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 ring-1 ring-primary/20">
                                        <MessageCircle className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Let’s discuss your project</h3>
                                </div>

                                <p className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed max-w-md">
                                    Skip the research and get direct answers. We’re here to help you navigate your unique requirements and find the perfect path forward.
                                </p>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                    <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
                                        <ButtonGroup className="hidden sm:flex">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="font-semibold text-muted-foreground/80 cursor-copy"
                                                onClick={() => {
                                                    navigator.clipboard.writeText("contact@echoray.io");
                                                    toast.success("Email copied to clipboard");
                                                }}
                                            >
                                                <Copy className="w-4 h-4 mr-2" />
                                                contact@echoray.io
                                            </Button>
                                            <Button
                                                variant="outline"
                                                asChild
                                                size="lg"
                                                className="font-bold"
                                            >
                                                <a href="mailto:contact@echoray.io">
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Email Us
                                                </a>
                                            </Button>
                                        </ButtonGroup>

                                        {/* Mobile Button Stack */}
                                        <div className="flex flex-col gap-3 sm:hidden">
                                            <ButtonGroup className="flex w-full">
                                                <Button
                                                    variant="outline"
                                                    asChild
                                                    size="lg"
                                                    className="font-bold flex-1"
                                                >
                                                    <a href="mailto:contact@echoray.io">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        Email Us
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="lg"
                                                    className="px-4 text-muted-foreground/80 cursor-copy"
                                                    onClick={() => {
                                                        const email = "contact@echoray.io";
                                                        if (navigator?.clipboard?.writeText) {
                                                            navigator.clipboard.writeText(email)
                                                                .then(() => toast.success("Email copied to clipboard"))
                                                                .catch(() => toast.error("Failed to copy"));
                                                        } else {
                                                            const textArea = document.createElement("textarea");
                                                            textArea.value = email;
                                                            document.body.appendChild(textArea);
                                                            textArea.select();
                                                            try {
                                                                document.execCommand('copy');
                                                                toast.success("Email copied to clipboard");
                                                            } catch (err) {
                                                                toast.error("Failed to copy");
                                                            }
                                                            document.body.removeChild(textArea);
                                                        }
                                                    }}
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </ButtonGroup>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={scrollToNext}
                                        size="lg"
                                        className="font-bold "
                                    >
                                        <Phone className="w-4 h-4 mr-2" />
                                        Book Free Call
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column - FAQ Accordion (Moves to top on mobile) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full order-1 lg:order-2"
                    >
                        <Accordion type="single" collapsible className="space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border  border-border rounded-xl px-4 bg-card data-[state=open]:border-primary/50 transition-all duration-300"
                                >
                                    <AccordionTrigger className="text-left font-semibold py-4 text-base hover:no-underline">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-4">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
