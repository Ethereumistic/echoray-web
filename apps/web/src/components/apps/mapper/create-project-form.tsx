"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@echoray/ui/components/ui/button";
import { Input } from "@echoray/ui/components/ui/input";
import { Textarea } from "@echoray/ui/components/ui/textarea";
import { Label } from "@echoray/ui/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader } from "@echoray/ui/components/ui/card";
import { IconPicker } from "./icon-picker";
import { Loader2 } from "lucide-react";

interface CreateProjectFormProps {
    scope: string;
    slug: string;
}

export function CreateProjectForm({ scope, slug }: CreateProjectFormProps) {
    const router = useRouter();
    const createProject = useMutation(api.mapping.projects.create);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState("📊");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Project name is required");
            return;
        }

        setIsSubmitting(true);

        try {
            const projectId = await createProject({
                name: name.trim(),
                description: description.trim() || undefined,
                icon,
                type: scope === "p" ? "personal" : "organization",
                ownerId: slug as Id<"users"> | Id<"organizations">,
            });

            toast.success("Project created successfully!");

            // Redirect to template builder
            router.push(`/${scope}/${slug}/mapper/${projectId}/template`);
        } catch (error) {
            console.error("Error creating project:", error);
            toast.error("Failed to create project");
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push(`/${scope}/${slug}/mapper`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <IconPicker value={icon} onChange={setIcon} />
                        <div className="flex-1">
                            <Label htmlFor="name" className="text-base font-semibold">
                                Project Name *
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g., Website Inventory, Client Database, Task Tracker"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-2"
                                required
                                maxLength={100}
                                autoFocus
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="description" className="text-base font-semibold">
                            Description
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                (Optional)
                            </span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="What will you use this project for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-2 resize-none"
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {description.length}/500 characters
                        </p>
                    </div>
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
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Project
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
