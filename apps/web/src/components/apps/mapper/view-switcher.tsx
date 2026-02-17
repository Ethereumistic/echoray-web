"use client";

import { Button } from "@echoray/ui/components/ui/button";
import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@echoray/ui/lib/utils";

interface ViewSwitcherProps {
    currentView: "table" | "grid";
    onViewChange: (view: "table" | "grid") => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
    return (
        <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "gap-2",
                    currentView === "table" && "bg-accent"
                )}
                onClick={() => onViewChange("table")}
            >
                <Table2 className="w-4 h-4" />
                Table
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className={cn(
                    "gap-2",
                    currentView === "grid" && "bg-accent"
                )}
                onClick={() => onViewChange("grid")}
            >
                <LayoutGrid className="w-4 h-4" />
                Grid
            </Button>
        </div>
    );
}
