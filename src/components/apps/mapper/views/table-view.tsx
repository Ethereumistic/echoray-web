"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FieldDisplay } from "../field-types/field-display";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Database } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableViewProps {
    projectId: string;
    template: {
        fields: Array<{ id: string; name: string; type: string; required: boolean; order: number; config?: unknown }>;
    };
    scope: string;
    slug: string;
}

export function TableView({ projectId, template, scope, slug }: TableViewProps) {
    const cards = useQuery(api.mapping.cards.list, {
        projectId: projectId as Id<"mapping_projects">,
        includeArchived: false,
    });

    if (!cards) {
        return <div className="p-8 text-muted-foreground">Loading cards...</div>;
    }

    if (cards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="rounded-full bg-primary/10 p-6 mb-6">
                    <Database className="w-16 h-16 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">No cards yet</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    Start adding cards to populate your database
                </p>
                <Link href={`/${scope}/${slug}/mapper/${projectId}/card/new`}>
                    <Button size="lg">
                        <Database className="w-4 h-4 mr-2" />
                        Create First Card
                    </Button>
                </Link>
            </div>
        );
    }

    const sortedFields = [...template.fields].sort((a, b) => a.order - b.order);

    return (
        <ScrollArea className="h-full w-full">
            <div className="p-4">
                <div className="rounded-lg border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {sortedFields.map((field) => (
                                    <TableHead key={field.id} className="font-semibold">
                                        {field.name}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </TableHead>
                                ))}
                                <TableHead className="w-24 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cards.map((card) => (
                                <TableRow key={card._id} className="hover:bg-accent/50">
                                    {sortedFields.map((field) => (
                                        <TableCell key={field.id}>
                                            <FieldDisplay
                                                fieldType={field.type}
                                                value={card.values?.[field.id]}
                                                config={field.config as Record<string, unknown> | undefined}
                                            />
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/${scope}/${slug}/mapper/${projectId}/card/${card._id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon">
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </ScrollArea>
    );
}
