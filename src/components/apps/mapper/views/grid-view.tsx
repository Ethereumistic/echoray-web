"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldDisplay } from "../field-types/field-display";
import { Edit, Database } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GridViewProps {
    projectId: string;
    template: {
        fields: Array<{ id: string; name: string; type: string; required: boolean; order: number; config?: unknown }>;
    };
    scope: string;
    slug: string;
}

export function GridView({ projectId, template, scope, slug }: GridViewProps) {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {cards.map((card) => (
                        <Card key={card._id} className="hover:shadow-lg transition-all group">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg">
                                        {sortedFields[0] ? (
                                            <FieldDisplay
                                                fieldType={sortedFields[0].type}
                                                value={card.values?.[sortedFields[0].id]}
                                                config={sortedFields[0].config as Record<string, unknown> | undefined}
                                            />
                                        ) : (
                                            "Card"
                                        )}
                                    </CardTitle>
                                    <Link href={`/${scope}/${slug}/mapper/${projectId}/card/${card._id}`}>
                                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {sortedFields.slice(1, 5).map((field) => (
                                    <div key={field.id} className="space-y-1">
                                        <div className="text-xs text-muted-foreground font-medium">
                                            {field.name}
                                        </div>
                                        <div className="text-sm">
                                            <FieldDisplay
                                                fieldType={field.type}
                                                value={card.values?.[field.id]}
                                                config={field.config as Record<string, unknown> | undefined}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {sortedFields.length > 5 && (
                                    <div className="text-xs text-muted-foreground">
                                        +{sortedFields.length - 5} more field{sortedFields.length - 5 !== 1 ? 's' : ''}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </ScrollArea>
    );
}
