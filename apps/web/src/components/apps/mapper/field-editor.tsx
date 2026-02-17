"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FieldEditorProps {
    projectId: Id<"mapping_projects">;
    fieldId: string;
    onClose: () => void;
}

export function FieldEditor({ projectId, fieldId, onClose }: FieldEditorProps) {
    const template = useQuery(api.mapping.templates.getByProject, { projectId });
    const updateField = useMutation(api.mapping.templates.updateField);

    const [name, setName] = useState("");
    const [required, setRequired] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const field = template?.fields.find((f) => f.id === fieldId);

    useEffect(() => {
        if (field) {
            setName(field.name);
            setRequired(field.required);
        }
    }, [field]);

    if (!field) {
        return null;
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Field name is required");
            return;
        }

        setIsSaving(true);

        try {
            await updateField({
                projectId,
                fieldId,
                updates: {
                    name: name.trim(),
                    required,
                },
            });
            toast.success("Field updated successfully");
            onClose();
        } catch (error) {
            console.error("Error updating field:", error);
            toast.error("Failed to update field");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Field</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="field-name">Field Name</Label>
                        <Input
                            id="field-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Product Name, Price, Description"
                            className="mt-2"
                            autoFocus
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="field-required">Required Field</Label>
                            <p className="text-sm text-muted-foreground">
                                Users must fill this field when creating cards
                            </p>
                        </div>
                        <Switch
                            id="field-required"
                            checked={required}
                            onCheckedChange={setRequired}
                        />
                    </div>

                    <div className="pt-2">
                        <Label className="text-muted-foreground text-xs">Field Type</Label>
                        <p className="text-sm font-mono mt-1">{field.type}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Field type cannot be changed after creation
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
