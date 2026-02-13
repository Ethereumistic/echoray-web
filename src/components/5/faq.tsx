"use client"

import { motion, animate } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MessageCircle, ArrowRight, HelpCircle, Phone, Mail, Copy } from "lucide-react"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { toast } from "sonner"

// Customize your scroll settings here
const SCROLL_OFFSET = -1000; // Negative values scroll further down, positive values stop earlier
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
            const targetScroll = nextSection.getBoundingClientRect().top + currentScroll - SCROLL_OFFSET;

            animate(currentScroll, targetScroll, {
                duration: SCROLL_DURATION,
                ease: [0.16, 1, 0.3, 1], // Premium smooth easing
                onUpdate: (value) => window.scrollTo(0, value)
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
                    className="text-center max-w-3xl mx-auto mb-12"
                >
                    <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-foreground mb-6 leading-tight">
                        Got Questions?<br />
                        We have <span className="text-primary ">Answers</span>
                    </h2>
                    <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Everything you need to know about our process, pricing, and how we help you scale your digital presence.
                    </p>
                </motion.div>


                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start max-w-7xl mx-auto">
                    {/* Left column - Help Card */}
                    <div className="lg:sticky lg:top-32">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            whileHover={{ y: -5, transition: { duration: 0.3 } }}
                            className="relative group p-6 rounded-3xl border border-primary/10 bg-linear-to-br from-card/80 to-muted/50 backdrop-blur-2xl overflow-hidden shadow-xl shadow-primary/5"
                        >
                            {/* Animated Background Element */}
                            <div className="absolute -right-16 -top-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider uppercase text-emerald-500 mb-4 bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full ring-1 ring-emerald-500/20">
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                    Support Online
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:rotate-6 transition-transform duration-500 ring-1 ring-primary/20">
                                        <MessageCircle className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold tracking-tight">Still unsure?</h3>
                                </div>

                                <p className="text-muted-foreground mb-6 text-sm leading-relaxed max-w-[280px]">
                                    Our team is ready to jump on a quick call to answer all your questions.
                                </p>

                                <div className="flex items-center gap-3">
                                    <ButtonGroup>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="font-semibold text-muted-foreground/80 cursor-copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText("contact@echoray.io");
                                                toast.success("Email copied to clipboard");
                                            }}
                                        >
                                            <Copy className="w-3.5 h-3.5 mr-2" />
                                            contact@echoray.io
                                        </Button>
                                        <Button
                                            asChild
                                            size="lg"
                                            className="font-bold"
                                        >
                                            <a href="mailto:contact@echoray.io">
                                                <Mail className="w-3.5 h-3.5 mr-2" />
                                                Email Us
                                            </a>
                                        </Button>
                                    </ButtonGroup>
                                    <Button
                                        onClick={scrollToNext}
                                        variant="outline"
                                        size="lg"
                                        className=" font-bold transition-all"
                                    >
                                        <Phone className="w-3.5 h-3.5 mr-2" />
                                        Book a Free Call
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right column - FAQ Accordion */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full"
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
