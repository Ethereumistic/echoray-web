"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES } from "@/lib/mapper/currencies";
import type { FieldConfig } from "@/lib/mapper/field-types";

interface FieldInputProps {
    fieldId: string;
    fieldType: string;
    fieldName: string;
    value: unknown;
    onChange: (value: unknown) => void;
    config?: FieldConfig;
    required?: boolean;
}

/**
 * Universal field input router component
 * Routes to the appropriate input based on field type
 */
export function FieldInput({ fieldId, fieldType, fieldName, value, onChange, config, required }: FieldInputProps) {
    // TEXT CATEGORY
    if (fieldType === "text") {
        const textConfig = config as { placeholder?: string; maxLength?: number } | undefined;
        const textValue = typeof value === 'string' ? value : '';
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                    id={fieldId}
                    value={textValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={textConfig?.placeholder || "Enter text..."}
                    maxLength={textConfig?.maxLength || 255}
                    required={required}
                />
            </div>
        );
    }

    if (fieldType === "long_text") {
        const longTextConfig = config as { placeholder?: string; rows?: number; maxLength?: number } | undefined;
        const textValue = typeof value === 'string' ? value : '';
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Textarea
                    id={fieldId}
                    value={textValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={longTextConfig?.placeholder || "Enter text..."}
                    rows={longTextConfig?.rows || 4}
                    maxLength={longTextConfig?.maxLength || 5000}
                    required={required}
                    className="resize-none"
                />
            </div>
        );
    }

    if (fieldType === "url") {
        const urlValue = typeof value === 'string' ? value : '';
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                    id={fieldId}
                    type="url"
                    value={urlValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://example.com"
                    required={required}
                />
            </div>
        );
    }

    if (fieldType === "email") {
        const emailValue = typeof value === 'string' ? value : '';
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                    id={fieldId}
                    type="email"
                    value={emailValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="user@example.com"
                    required={required}
                />
            </div>
        );
    }

    // NUMBERS CATEGORY
    if (fieldType === "number") {
        const numberConfig = config as { decimals?: number } | undefined;
        const numberValue = typeof value === 'number' ? value : '';
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                    id={fieldId}
                    type="number"
                    value={numberValue}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    step={numberConfig?.decimals ? `0.${"0".repeat(numberConfig.decimals - 1)}1` : "1"}
                    required={required}
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
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="flex gap-2">
                    <Select
                        value={currencyValue.currency}
                        onValueChange={(currency) => onChange({ ...currencyValue, currency })}
                    >
                        <SelectTrigger className="w-32">
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
                    <Input
                        id={fieldId}
                        type="number"
                        value={currencyValue.amount || ""}
                        onChange={(e) => onChange({ ...currencyValue, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        step="0.01"
                        className="flex-1"
                        required={required}
                    />
                </div>
            </div>
        );
    }

    if (fieldType === "percentage") {
        const percentConfig = config as { showProgressBar?: boolean } | undefined;
        const percentValue = typeof value === 'number' ? value : 0;
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="space-y-2">
                    <Input
                        id={fieldId}
                        type="number"
                        value={percentValue}
                        onChange={(e) => onChange(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        min="0"
                        max="100"
                        required={required}
                    />
                    {percentConfig?.showProgressBar && (
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
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                    id={fieldId}
                    type="date"
                    value={dateValue}
                    onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : null)}
                    required={required}
                />
            </div>
        );
    }

    if (fieldType === "datetime") {
        const dateValue = typeof value === 'number' && value ? new Date(value).toISOString().slice(0, 16) : '';
        return (
            <div className="space-y-2">
                <Label htmlFor={fieldId}>
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                    id={fieldId}
                    type="datetime-local"
                    value={dateValue}
                    onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : null)}
                    required={required}
                />
            </div>
        );
    }

    // BOOLEAN CATEGORY
    if (fieldType === "checkbox") {
        const isChecked = Boolean(value);
        return (
            <div className="flex items-center space-x-2">
                <Checkbox
                    id={fieldId}
                    checked={isChecked}
                    onCheckedChange={(checked) => onChange(checked)}
                />
                <Label htmlFor={fieldId} className="cursor-pointer">
                    {fieldName}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
            </div>
        );
    }

    // Default fallback
    const fallbackValue = typeof value === 'string' ? value : '';
    return (
        <div className="space-y-2">
            <Label htmlFor={fieldId}>
                {fieldName}
                {required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
                id={fieldId}
                value={fallbackValue}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Enter ${fieldName.toLowerCase()}...`}
                required={required}
            />
            <p className="text-xs text-muted-foreground mt-1">
                Field type &quot;{fieldType}&quot; not yet implemented
            </p>
        </div>
    );
}
