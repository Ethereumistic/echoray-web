"use client";

import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    MoreVertical,
    Archive,
    Trash2,
    Database,
    FileText,
    Calendar
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Project {
    _id: Id<"mapping_projects">;
    name: string;
    description?: string;
    icon?: string;
    cardCount: number;
    updatedAt: number;
    createdAt: number;
}

interface MapperProjectCardProps {
    project: Project;
    scope: string;
    slug: string;
}

export function MapperProjectCard({ project, scope, slug }: MapperProjectCardProps) {
    const archiveProject = useMutation(api.mapping.projects.archive);
    const deleteProject = useMutation(api.mapping.projects.deleteProject);

    const handleArchive = async () => {
        try {
            await archiveProject({ projectId: project._id });
            toast.success("Project archived successfully");
        } catch (error) {
            toast.error("Failed to archive project");
            console.error(error);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this project? This action cannot be undone and will delete all cards and templates."
        );

        if (!confirmed) return;

        try {
            await deleteProject({ projectId: project._id });
            toast.success("Project deleted successfully");
        } catch (error) {
            toast.error("Failed to delete project");
            console.error(error);
        }
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-200 hover:border-primary/50 group">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                            {project.icon ? (
                                <span className="text-2xl">{project.icon}</span>
                            ) : (
                                <Database className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                {project.name}
                            </CardTitle>
                            <CardDescription className="text-sm mt-1 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {project.cardCount} {project.cardCount === 1 ? "card" : "cards"}
                            </CardDescription>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(); }}>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                    </p>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/${scope}/${slug}/mapper/${project._id}`} className="w-full">
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <FileText className="w-4 h-4 mr-2" />
                        Open Project
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
