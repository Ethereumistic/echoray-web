"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/mapper/currencies";
import { stripProtocol } from "@/lib/mapper/utils";
import type { FieldConfig } from "@/lib/mapper/field-types";
import { cn } from "@/lib/utils";

interface FieldInputProps {
    fieldId: string;
    fieldType: string;
    fieldName: string;
    value: unknown;
    onChange: (value: unknown) => void;
    config?: FieldConfig;
    required?: boolean;
    minimal?: boolean;
}

/**
 * Universal field input router component
 * Routes to the appropriate input based on field type
 */
export function FieldInput({ fieldId, fieldType, fieldName, value, onChange, config, required, minimal }: FieldInputProps) {
    // TEXT CATEGORY
    if (fieldType === "text") {
        const textConfig = config as { placeholder?: string; maxLength?: number } | undefined;
        const textValue = typeof value === 'string' ? value : '';
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Input
                    id={fieldId}
                    value={textValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={textConfig?.placeholder || "Enter text..."}
                    maxLength={textConfig?.maxLength || 255}
                    required={required}
                    className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                />
            </div>
        );
    }

    if (fieldType === "long_text") {
        const longTextConfig = config as { placeholder?: string; rows?: number; maxLength?: number } | undefined;
        const textValue = typeof value === 'string' ? value : '';
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Textarea
                    id={fieldId}
                    value={textValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={longTextConfig?.placeholder || "Enter text..."}
                    rows={minimal ? 1 : (longTextConfig?.rows || 4)}
                    maxLength={longTextConfig?.maxLength || 5000}
                    required={required}
                    className={cn(
                        "resize-none",
                        minimal ? "border-none focus-visible:ring-0 min-h-0 h-full p-2" : ""
                    )}
                />
            </div>
        );
    }

    if (fieldType === "url") {
        const urlValue = typeof value === 'string' ? value : '';

        const handleUrlChange = (newValue: string) => {
            // Strip protocol and www prefix before saving to database
            // This keeps the database clean and prevents duplication bugs
            const cleanUrl = stripProtocol(newValue);
            onChange(cleanUrl);
        };

        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Input
                    id={fieldId}
                    type="text"
                    value={urlValue}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onBlur={(e) => handleUrlChange(e.target.value)}
                    placeholder="example.com"
                    required={required}
                    className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                />
            </div>
        );
    }

    if (fieldType === "email") {
        const emailValue = typeof value === 'string' ? value : '';
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Input
                    id={fieldId}
                    type="email"
                    value={emailValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="user@example.com"
                    required={required}
                    className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                />
            </div>
        );
    }

    // NUMBERS CATEGORY
    if (fieldType === "number") {
        const numberConfig = config as { decimals?: number } | undefined;
        const numberValue = typeof value === 'number' ? value : '';
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Input
                    id={fieldId}
                    type="number"
                    value={numberValue}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    step={numberConfig?.decimals ? `0.${"0".repeat(numberConfig.decimals - 1)}1` : "1"}
                    required={required}
                    className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                />
            </div>
        );
    }

    if (fieldType === "currency") {
        const currencyConfig = config as { currency?: string } | undefined;
        const currencyValue = (value as { amount: number; currency: string } | null) || {
            amount: 0,
            currency: currencyConfig?.currency || "USD"
        };

        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <div className="flex gap-2 h-full items-center">
                    <Input
                        id={fieldId}
                        type="number"
                        value={currencyValue.amount || ""}
                        onChange={(e) => onChange({ ...currencyValue, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.01"
                        className={cn("flex-1", minimal ? "border-none focus-visible:ring-0 h-full p-2 shadow-none" : "")}
                        required={required}
                    />
                    <Select
                        value={currencyValue.currency}
                        onValueChange={(currency) => onChange({ ...currencyValue, currency })}
                    >
                        <SelectTrigger className={cn("w-20", minimal ? "border-none focus:ring-0 h-full shadow-none" : "w-32")}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {CURRENCIES.map((curr) => (
                                <SelectItem key={curr.code} value={curr.code}>
                                    {curr.code} {curr.symbol}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        );
    }

    if (fieldType === "percentage") {
        const percentConfig = config as { showProgressBar?: boolean } | undefined;
        const percentValue = typeof value === 'number' ? value : 0;
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <div className="space-y-2">
                    <Input
                        id={fieldId}
                        type="number"
                        value={percentValue}
                        onChange={(e) => onChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        min="0"
                        max="100"
                        required={required}
                        className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                    />
                    {percentConfig?.showProgressBar && !minimal && (
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${percentValue}%` }}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // DATE & TIME CATEGORY
    if (fieldType === "date") {
        const dateValue = typeof value === 'number' && value ? new Date(value).toISOString().split('T')[0] : '';
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Input
                    id={fieldId}
                    type="date"
                    value={dateValue}
                    onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : null)}
                    required={required}
                    className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                />
            </div>
        );
    }

    if (fieldType === "datetime") {
        const dateValue = typeof value === 'number' && value ? new Date(value).toISOString().slice(0, 16) : '';
        return (
            <div className={minimal ? "" : "space-y-2"}>
                {!minimal && (
                    <Label htmlFor={fieldId}>
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
                <Input
                    id={fieldId}
                    type="datetime-local"
                    value={dateValue}
                    onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : null)}
                    required={required}
                    className={minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""}
                />
            </div>
        );
    }

    // BOOLEAN CATEGORY
    if (fieldType === "checkbox") {
        const isChecked = Boolean(value);
        return (
            <div className={cn("flex items-center py-2 space-x-2", minimal ? "justify-center h-full" : "")}>
                <Checkbox
                    id={fieldId}
                    checked={isChecked}
                    onCheckedChange={(checked) => onChange(checked)}
                />
                {!minimal && (
                    <Label htmlFor={fieldId} className="cursor-pointer">
                        {fieldName}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                )}
            </div>
        );
    }

    // Default fallback - for unimplemented types
    return (
        <div className={minimal ? "" : "space-y-2"}>
            {!minimal && (
                <Label htmlFor={fieldId} className="opacity-50">
                    {fieldName}
                    <span className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground uppercase font-bold tracking-wider">Soon</span>
                </Label>
            )}
            <Input
                id={fieldId}
                value={String(value || "")}
                disabled
                placeholder="Coming soon..."
                className={cn(
                    "opacity-50 cursor-not-allowed",
                    minimal ? "border-none focus-visible:ring-0 h-full p-2" : ""
                )}
            />
        </div>
    );
}
