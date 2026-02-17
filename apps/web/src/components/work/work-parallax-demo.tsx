"use client";
import React from "react";
import { WorkParallax } from "./work-parallax";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function WorkParallaxDemo() {
    const projects = useQuery(api.work.getPublishedProjects);

    const products = projects?.map((p) => ({
        title: p.title,
        slug: p.slug,
        link: p.link,
        thumbnail: p.thumbnail,
    })) ?? [];

    // Show nothing while loading (avoids layout flash)
    if (projects === undefined) {
        return (
            <div className="h-[350vh] flex items-start justify-center pt-40">
                <div className="text-center space-y-4">
                    <div className="size-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading projects...</p>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return <WorkParallax products={products} />;
}
