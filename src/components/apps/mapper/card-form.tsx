"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldInput } from "./field-types/field-input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CardFormProps {
    projectId: string;
    cardId?: string;
    scope: string;
    slug: string;
}

export function CardForm({ projectId, cardId, scope, slug }: CardFormProps) {
    const router = useRouter();

    const template = useQuery(api.mapping.templates.getByProject, {
        projectId: projectId as Id<"mapping_projects">,
    });

    // Always call hooks - use optional chaining for cardId
    const existingCard = useQuery(
        api.mapping.cards.get,
        cardId ? { cardId: cardId as Id<"mapping_cards"> } : "skip"
    );

    const createCard = useMutation(api.mapping.cards.create);
    const updateCard = useMutation(api.mapping.cards.update);

    const [values, setValues] = useState<Record<string, unknown>>(existingCard?.values || {});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update values when existing card loads
    useEffect(() => {
        if (existingCard?.values) {
            setValues(existingCard.values);
        }
    }, [existingCard]);

    if (!template) {
        return <div className="text-muted-foreground">Loading...</div>;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        for (const field of template.fields) {
            if (field.required) {
                const value = values[field.id];
                if (value === undefined || value === null || value === "") {
                    toast.error(`Field "${field.name}" is required`);
                    return;
                }
            }
        }

        setIsSubmitting(true);

        try {
            if (cardId) {
                await updateCard({
                    cardId: cardId as Id<"mapping_cards">,
                    values,
                });
                toast.success("Card updated successfully!");
            } else {
                await createCard({
                    projectId: projectId as Id<"mapping_projects">,
                    values,
                });
                toast.success("Card created successfully!");
            }

            router.push(`/${scope}/${slug}/mapper/${projectId}`);
        } catch (error) {
            console.error("Error saving card:", error);
            toast.error("Failed to save card");
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${scope}/${slug}/mapper/${projectId}`);
    };

    const handleFieldChange = (fieldId: string, value: unknown) => {
        setValues((prev) => ({
            ...prev,
            [fieldId]: value,
        }));
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>{cardId ? "Edit Card" : "New Card"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {template.fields.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No fields in template</p>
                            <p className="text-sm mt-2">Add fields in the template builder first</p>
                        </div>
                    ) : (
                        template.fields
                            .sort((a, b) => a.order - b.order)
                            .map((field) => (
                                <FieldInput
                                    key={field.id}
                                    fieldId={field.id}
                                    fieldType={field.type}
                                    fieldName={field.name}
                                    value={values[field.id]}
                                    onChange={(value) => handleFieldChange(field.id, value)}
                                    config={field.config}
                                    required={field.required}
                                />
                            ))
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || template.fields.length === 0}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {cardId ? "Save Changes" : "Create Card"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
