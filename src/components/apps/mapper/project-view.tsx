"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Plus, Settings, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { TableView } from "./views/table-view";
import { GridView } from "./views/grid-view";
import { ViewSwitcher } from "./view-switcher";
import { useState } from "react";

interface ProjectViewProps {
    projectId: string;
    scope: string;
    slug: string;
}

export function ProjectView({ projectId, scope, slug }: ProjectViewProps) {
    const project = useQuery(api.mapping.projects.get, {
        projectId: projectId as Id<"mapping_projects">,
    });

    const template = useQuery(api.mapping.templates.getByProject, {
        projectId: projectId as Id<"mapping_projects">,
    });

    const [viewType, setViewType] = useState<"table" | "grid">("table");

    if (!project || !template) {
        return <div className="p-8 text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href={`/${scope}/${slug}/mapper`}>
                            <Button variant="ghost" size="sm">
                                <ChevronLeft className="w-4 h-4 mr-2" />
                                Projects
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {project.icon && <span className="text-4xl">{project.icon}</span>}
                            <div>
                                <h1 className="text-3xl font-bold">{project.name}</h1>
                                {project.description && (
                                    <p className="text-muted-foreground mt-1">{project.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <ViewSwitcher currentView={viewType} onViewChange={setViewType} />
                            <Link href={`/${scope}/${slug}/mapper/${projectId}/template`}>
                                <Button variant="outline" size="sm">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Template
                                </Button>
                            </Link>
                            <Link href={`/${scope}/${slug}/mapper/${projectId}/card/new`}>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Card
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden">
                {viewType === "table" ? (
                    <TableView projectId={projectId} template={template} scope={scope} slug={slug} />
                ) : (
                    <GridView projectId={projectId} template={template} scope={scope} slug={slug} />
                )}
            </div>
        </div>
    );
}
