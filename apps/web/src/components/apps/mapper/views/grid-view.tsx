"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldDisplay } from "../field-types/field-display";
import { FieldInput } from "../field-types/field-input";
import { Save, X, Database, Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useMemo } from "react";
import { toast } from "sonner";

interface GridViewProps {
    projectId: string;
    template: {
        fields: Array<{ id: string; name: string; type: string; required: boolean; order: number; config?: unknown }>;
    };
    scope: string;
    slug: string;
    searchQuery?: string;
}

export function GridView({
    projectId,
    template,
    scope,
    slug,
    searchQuery = ""
}: GridViewProps) {
    const cards = useQuery(api.mapping.cards.list, {
        projectId: projectId as Id<"mapping_projects">,
        includeArchived: false,
    });

    const updateCard = useMutation(api.mapping.cards.update);
    const deleteCard = useMutation(api.mapping.cards.deleteCard);

    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, unknown>>({});
    const [isSaving, setIsSaving] = useState(false);

    const filteredCards = useMemo(() => {
        if (!cards) return [];
        if (!searchQuery.trim()) return cards;

        const query = searchQuery.toLowerCase();
        return cards.filter((card) => {
            return Object.values(card.values || {}).some((val) =>
                String(val).toLowerCase().includes(query)
            );
        });
    }, [cards, searchQuery]);

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

    const handleEdit = (cardId: string, currentValues: Record<string, unknown>) => {
        setEditingCardId(cardId);
        setEditValues(currentValues);
    };

    const handleCancel = () => {
        setEditingCardId(null);
        setEditValues({});
    };

    const handleSave = async (cardId: string) => {
        // Validate required fields
        for (const field of sortedFields) {
            if (field.required) {
                const value = editValues[field.id];
                if (value === undefined || value === null || value === "") {
                    toast.error(`Field "${field.name}" is required`);
                    return;
                }
            }
        }

        setIsSaving(true);
        try {
            await updateCard({
                cardId: cardId as Id<"mapping_cards">,
                values: editValues,
            });
            toast.success("Card updated successfully!");
            setEditingCardId(null);
            setEditValues({});
        } catch (error) {
            console.error("Error updating card:", error);
            toast.error("Failed to update card");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (fieldId: string, value: unknown) => {
        setEditValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    const handleDelete = async (cardId: string) => {
        if (!confirm("Are you sure you want to delete this card?")) {
            return;
        }

        try {
            await deleteCard({ cardId: cardId as Id<"mapping_cards"> });
            toast.success("Card deleted successfully!");
        } catch (error) {
            console.error("Error deleting card:", error);
            toast.error("Failed to delete card");
        }
    };

    return (
        <ScrollArea className="h-full w-full">
            <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredCards.map((card) => {
                        const isEditing = editingCardId === card._id;
                        const displayValues = isEditing ? editValues : card.values;

                        return (
                            <Card key={card._id} className={`transition-all ${isEditing ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <CardTitle className="text-lg">
                                            {sortedFields[0] ? (
                                                isEditing ? (
                                                    <FieldInput
                                                        fieldId={`${card._id}-${sortedFields[0].id}`}
                                                        fieldType={sortedFields[0].type}
                                                        fieldName=""
                                                        value={displayValues?.[sortedFields[0].id]}
                                                        onChange={(value) => handleFieldChange(sortedFields[0].id, value)}
                                                        config={sortedFields[0].config as Record<string, unknown> | undefined}
                                                        required={sortedFields[0].required}
                                                    />
                                                ) : (
                                                    <FieldDisplay
                                                        fieldType={sortedFields[0].type}
                                                        value={card.values?.[sortedFields[0].id]}
                                                        config={sortedFields[0].config as Record<string, unknown> | undefined}
                                                    />
                                                )
                                            ) : (
                                                "Card"
                                            )}
                                        </CardTitle>
                                        {!isEditing && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(card._id, card.values || {})}
                                                disabled={!!editingCardId}
                                                className="h-8 px-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {sortedFields.slice(1, 5).map((field) => (
                                        <div key={field.id} className="space-y-1">
                                            <div className="text-xs text-muted-foreground font-medium">
                                                {field.name}
                                            </div>
                                            <div className="text-sm">
                                                {isEditing ? (
                                                    <FieldInput
                                                        fieldId={`${card._id}-${field.id}`}
                                                        fieldType={field.type}
                                                        fieldName=""
                                                        value={displayValues?.[field.id]}
                                                        onChange={(value) => handleFieldChange(field.id, value)}
                                                        config={field.config as Record<string, unknown> | undefined}
                                                        required={field.required}
                                                    />
                                                ) : (
                                                    <FieldDisplay
                                                        fieldType={field.type}
                                                        value={card.values?.[field.id]}
                                                        config={field.config as Record<string, unknown> | undefined}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {sortedFields.length > 5 && (
                                        <div className="text-xs text-muted-foreground">
                                            +{sortedFields.length - 5} more field{sortedFields.length - 5 !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                    {isEditing && (
                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave(card._id)}
                                                disabled={isSaving}
                                                className="flex-1"
                                            >
                                                <Save className="w-4 h-4 mr-1" />
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={isSaving}
                                                className="flex-1"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                    {!isEditing && (
                                        <div className="pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDelete(card._id)}
                                                disabled={!!editingCardId}
                                                className="w-full text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </ScrollArea>
    );
}
