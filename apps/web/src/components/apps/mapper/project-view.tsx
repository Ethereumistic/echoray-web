"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@echoray/ui/components/ui/button";
import { Plus, Settings, ChevronLeft, Search, X, Database, ListPlus } from "lucide-react";
import Link from "next/link";
import { TableView } from "./views/table-view";
import { GridView } from "./views/grid-view";
import { ViewSwitcher } from "./view-switcher";
import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Input } from "@echoray/ui/components/ui/input";
import { Separator } from "@echoray/ui/components/ui/separator";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingRow, setIsAddingRow] = useState(false);

    if (!project || !template) {
        return <div className="p-8 text-muted-foreground">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <DashboardHeader
                appName="Mapper"
                appHref={`/${scope}/${slug}/mapper`}
                projectName={project.name}
                projectIcon={project.icon}
            >
                {/* Secondary Toolbar */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center flex-1 max-w-sm relative text-muted-foreground focus-within:text-foreground transition-colors">
                        <Search className="w-3.5 h-3.5 absolute left-3" />
                        <Input
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-8 text-[11px] bg-background/50 border-border/50 focus-visible:ring-primary/20"
                        />
                        {searchQuery && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-1 h-6 w-6 p-0 hover:bg-transparent"
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <ViewSwitcher currentView={viewType} onViewChange={setViewType} />
                        <Separator orientation="vertical" className="h-4 mx-1 bg-border/50" />
                        <Link href={`/${scope}/${slug}/mapper/${projectId}/template`}>
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Settings className="w-3.5 h-3.5 mr-1.5" />
                                <span className="hidden sm:inline">Settings</span>
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            className="h-8 text-xs px-3"
                            onClick={() => setIsAddingRow(true)}
                            disabled={isAddingRow}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            New Record
                        </Button>
                    </div>
                </div>
            </DashboardHeader>

            {/* View Content */}
            <div className="flex-1 overflow-hidden">
                {viewType === "table" ? (
                    <TableView
                        projectId={projectId}
                        template={template}
                        scope={scope}
                        slug={slug}
                        searchQuery={searchQuery}
                        isAddingRow={isAddingRow}
                        setIsAddingRow={setIsAddingRow}
                    />
                ) : (
                    <GridView
                        projectId={projectId}
                        template={template}
                        scope={scope}
                        slug={slug}
                        searchQuery={searchQuery}
                    />
                )}
            </div>
        </div>
    );
}
