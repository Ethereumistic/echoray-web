"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@echoray/ui/components/ui/button";
import { Card, CardHeader, CardContent } from "@echoray/ui/components/ui/card";
import { Plus, GripVertical, Trash2, Settings } from "lucide-react";
import { FieldTypeSelector } from "./field-type-selector";
import { FieldEditor } from "./field-editor";
import { CardPreview } from "./card-preview";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { FieldDefinition } from "@/lib/mapper";

interface TemplateBuilderProps {
    projectId: string;
    scope: string;
    slug: string;
}

export function TemplateBuilder({ projectId, scope, slug }: TemplateBuilderProps) {
    const router = useRouter();
    const template = useQuery(api.mapping.templates.getByProject, {
        projectId: projectId as Id<"mapping_projects">,
    });

    const addField = useMutation(api.mapping.templates.addField);
    const removeField = useMutation(api.mapping.templates.removeField);

    const [showTypeSelector, setShowTypeSelector] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

    if (!template) {
        return <div className="text-muted-foreground">Loading template...</div>;
    }

    const handleAddField = async (fieldType: string) => {
        try {
            await addField({
                projectId: projectId as Id<"mapping_projects">,
                field: {
                    name: "New Field",
                    type: fieldType,
                    required: false,
                    config: {}, // Field config will be set in editor
                },
            });
            setShowTypeSelector(false);
            toast.success("Field added successfully");
        } catch (error) {
            console.error("Error adding field:", error);
            toast.error("Failed to add field");
        }
    };

    const handleRemoveField = async (fieldId: string) => {
        if (!confirm("Are you sure you want to remove this field? This will delete all data in this field from existing cards.")) {
            return;
        }

        try {
            await removeField({
                projectId: projectId as Id<"mapping_projects">,
                fieldId,
            });
            toast.success("Field removed successfully");
        } catch (error) {
            console.error("Error removing field:", error);
            toast.error("Failed to remove field");
        }
    };

    const handleDone = () => {
        router.push(`/${scope}/${slug}/mapper/${projectId}`);
        toast.success("Template saved!");
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Field List */}
            <div>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Fields</h3>
                            <Button onClick={() => setShowTypeSelector(true)} size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Field
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {template.fields.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="mb-4">No fields yet</p>
                                <p className="text-sm">Click &quot;Add Field&quot; to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {template.fields
                                    .sort((a, b) => a.order - b.order)
                                    .map((field) => (
                                        <div
                                            key={field.id}
                                            className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent transition-colors"
                                        >
                                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                            <div className="flex-1">
                                                <div className="font-medium">{field.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {field.type} {field.required && "(Required)"}
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setEditingFieldId(field.id)}
                                            >
                                                <Settings className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveField(field.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {template.fields.length > 0 && (
                    <Button onClick={handleDone} className="w-full mt-6" size="lg">
                        Done - Go to Project
                    </Button>
                )}
            </div>

            {/* Right: Preview */}
            <div className="sticky top-8 h-fit">
                <CardPreview fields={template.fields as FieldDefinition[]} />
            </div>

            {/* Field Type Selector Modal */}
            {showTypeSelector && (
                <FieldTypeSelector
                    onSelect={handleAddField}
                    onClose={() => setShowTypeSelector(false)}
                />
            )}

            {/* Field Editor Modal */}
            {editingFieldId && (
                <FieldEditor
                    projectId={projectId as Id<"mapping_projects">}
                    fieldId={editingFieldId}
                    onClose={() => setEditingFieldId(null)}
                />
            )}
        </div>
    );
}
