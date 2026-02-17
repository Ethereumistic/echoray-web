"use client";

import { useState } from "react";
import { Button } from "@echoray/ui/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@echoray/ui/components/ui/popover";

const ICON_OPTIONS = [
    "📊", "📈", "📉", "🗂️", "📁", "📂", "🗃️", "📋", "📝",
    "📄", "📃", "📑", "🗒️", "📰", "📓", "📔", "📕", "📗",
    "📘", "📙", "📚", "📖", "🔖", "🏷️", "💼", "📦", "📮",
    "🗳️", "🏗️", "🏭", "🏢", "🏪", "🏬", "🏛️", "⚙️", "🔧",
    "🔨", "🛠️", "⚡", "🔥", "💡", "🎯", "🎪", "🎨", "🎬",
    "🎭", "🎰", "🎲", "🎯", "🏆", "🥇", "🥈", "🥉", "🏅",
    "⭐", "🌟", "✨", "💫", "🌈", "🔮", "💎", "💰", "💳",
    "🔔", "📱", "💻", "🖥️", "⌨️", "🖱️", "🖨️", "📷", "📹",
    "🎥", "📡", "🛰️", "🚀", "✈️", "🚂", "🚗", "🚕", "🏠",
];

interface IconPickerProps {
    value: string;
    onChange: (icon: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (icon: string) => {
        onChange(icon);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-16 h-16 text-3xl hover:bg-accent"
                >
                    {value}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Choose an icon</h4>
                    <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto">
                        {ICON_OPTIONS.map((icon) => (
                            <Button
                                key={icon}
                                type="button"
                                variant={value === icon ? "default" : "ghost"}
                                className="w-full h-10 text-xl p-0"
                                onClick={() => handleSelect(icon)}
                            >
                                {icon}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
