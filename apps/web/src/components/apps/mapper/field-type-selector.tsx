"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FIELD_METADATA, FIELD_ICONS, type FieldType, getAllCategories } from "@/lib/mapper";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface FieldTypeSelectorProps {
    onSelect: (fieldType: FieldType) => void;
    onClose: () => void;
}

export function FieldTypeSelector({ onSelect, onClose }: FieldTypeSelectorProps) {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const categories = getAllCategories();

    const filteredTypes = Object.values(FIELD_METADATA).filter((meta) => {
        const matchesSearch =
            meta.label.toLowerCase().includes(search.toLowerCase()) ||
            meta.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = !selectedCategory || meta.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryLabels: Record<string, string> = {
        text: "Text",
        numbers: "Numbers",
        date_time: "Date & Time",
        selection: "Selection",
        boolean: "Boolean",
        location: "Location",
        media: "Media",
        relation: "Relation",
        special: "Special",
        advanced: "Advanced",
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Choose Field Type</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search field types..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            size="sm"
                            variant={selectedCategory === null ? "default" : "outline"}
                            onClick={() => setSelectedCategory(null)}
                        >
                            All
                        </Button>
                        {categories.map((category) => (
                            <Button
                                key={category}
                                size="sm"
                                variant={selectedCategory === category ? "default" : "outline"}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {categoryLabels[category]}
                            </Button>
                        ))}
                    </div>

                    {/* Field Types Grid */}
                    <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-4">
                            {filteredTypes.map((meta) => {
                                const Icon = FIELD_ICONS[meta.type];
                                return (
                                    <Button
                                        key={meta.type}
                                        variant="outline"
                                        className={cn(
                                            "h-auto p-4 justify-start text-left",
                                            meta.isImplemented ? "hover:bg-accent cursor-pointer" : "opacity-50 grayscale cursor-not-allowed"
                                        )}
                                        onClick={() => meta.isImplemented && onSelect(meta.type)}
                                        disabled={!meta.isImplemented}
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <div className={cn(
                                                "p-2 rounded-lg",
                                                meta.isImplemented ? "bg-primary/10" : "bg-muted"
                                            )}>
                                                <Icon className={cn(
                                                    "w-5 h-5",
                                                    meta.isImplemented ? "text-primary" : "text-muted-foreground"
                                                )} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="font-semibold text-sm">{meta.label}</div>
                                                    {!meta.isImplemented && (
                                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">
                                                            Soon
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                    {meta.description}
                                                </div>
                                                {meta.isAdvanced && (
                                                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                                        Advanced
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
