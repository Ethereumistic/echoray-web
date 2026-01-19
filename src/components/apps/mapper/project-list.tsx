"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { MapperProjectCard } from "./project-card";
import { Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface MapperProjectListProps {
    scope: string;
    slug: string;
}

export function MapperProjectList({ scope, slug }: MapperProjectListProps) {
    const projects = useQuery(api.mapping.projects.list, {
        scope,
        slug,
        includeArchived: false,
    });

    if (!projects) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-pulse text-muted-foreground">Loading projects...</div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                    <Database className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No mapper projects yet</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    Create your first custom database to start organizing your data with flexible field types and powerful views.
                </p>
                <Link href={`/${scope}/${slug}/mapper/new`}>
                    <Button size="lg">
                        <Database className="w-4 h-4 mr-2" />
                        Create Your First Project
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                <MapperProjectCard
                    key={project._id}
                    project={project}
                    scope={scope}
                    slug={slug}
                />
            ))}
        </div>
    );
}
