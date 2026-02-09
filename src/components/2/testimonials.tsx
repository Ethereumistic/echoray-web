"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        quote: "They built exactly what we needed without overcomplicating things. Our customers love the new booking system.",
        author: "Maria K.",
        role: "Salon Owner",
    },
    {
        quote: "Professional, responsive, and they actually listen. Our new site brings in more leads than we expected.",
        author: "Stefan D.",
        role: "Construction Company",
    },
    {
        quote: "Finally, a team that explains things in plain language. The result exceeded our expectations.",
        author: "Elena P.",
        role: "Boutique Hotel",
    },
]

export function Testimonials2() {
    return (
        <section className="py-24 md:py-32 bg-muted/30">
            <div className="container mx-auto px-4 md:px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        What our clients say
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Real feedback from real businesses we&apos;ve helped grow.
                    </p>
                </motion.div>

                {/* Testimonials grid */}
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.author}
                            className="relative bg-card rounded-3xl border border-border p-8 shadow-sm"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            {/* Quote icon */}
                            <Quote className="w-10 h-10 text-primary/20 mb-4" />

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-chart-3 text-chart-3" />
                                ))}
                            </div>

                            {/* Quote */}
                            <blockquote className="text-lg mb-6 leading-relaxed">
                                &ldquo;{testimonial.quote}&rdquo;
                            </blockquote>

                            {/* Author */}
                            <div>
                                <div className="font-bold">{testimonial.author}</div>
                                <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
