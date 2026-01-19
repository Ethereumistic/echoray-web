"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FIELD_ICONS, type FieldDefinition } from "@/lib/mapper";
import { Eye } from "lucide-react";

interface CardPreviewProps {
    fields: FieldDefinition[];
}

export function CardPreview({ fields }: CardPreviewProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-lg">Preview</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                    How your cards will look with sample data
                </p>
            </CardHeader>
            <CardContent>
                {fields.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Add fields to see a preview</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {fields
                            .sort((a, b) => a.order - b.order)
                            .map((field) => {
                                const Icon = FIELD_ICONS[field.type as keyof typeof FIELD_ICONS];
                                const sampleValue = getSampleValue(field.type);

                                return (
                                    <div key={field.id} className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                            <label className="text-sm font-medium">
                                                {field.name}
                                                {field.required && (
                                                    <span className="text-destructive ml-1">*</span>
                                                )}
                                            </label>
                                        </div>
                                        <div className="pl-5">
                                            <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground bg-muted/30">
                                                {sampleValue}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function getSampleValue(fieldType: string): string {
    const samples: Record<string, string> = {
        text: "Sample text",
        long_text: "This is a longer text sample that would span multiple lines...",
        rich_text: "Formatted text with bold and italic",
        url: "https://example.com",
        email: "user@example.com",
        phone: "+1 (555) 123-4567",
        number: "42",
        currency: "$1,299.99",
        percentage: "75%",
        rating: "⭐⭐⭐⭐☆ (4/5)",
        date: "Jan 19, 2026",
        datetime: "Jan 19, 2026 3:15 PM",
        time: "3:15 PM",
        duration: "2h 30m",
        timestamp: "2 hours ago",
        dropdown: "Option 1",
        multiselect: "Option 1, Option 2",
        status: "In Progress",
        tags: "tag1, tag2, tag3",
        checkbox: "✓ Yes",
        toggle: "ON",
        location_name: "New York, NY",
        location_map: "View on Map 🗺️",
        coordinates: "40.7128° N, 74.0060° W",
        full_address: "123 Main St, New York, NY 10001",
        file: "document.pdf",
        document: "report.docx",
        image: "photo.jpg 📷",
        video: "video.mp4 🎥",
        user_reference: "@john_doe",
        org_reference: "Acme Corp",
        custom_relation: "→ Related Card",
        formula: "= 1299.99",
        auto_number: "#001",
        barcode_qr: "QR Code 📱",
        color_picker: "#3B82F6 🎨",
        json: "{ key: value }",
        markdown: "**Bold** and *italic* text",
        lookup: "Looked up value",
        rollup: "Sum: 1299.99",
        button: "[Click Me]",
        collaboration: "3 comments",
    };

    return samples[fieldType] || "Sample value";
}
