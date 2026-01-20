"use client";

import { formatCurrency } from "@/lib/mapper/currencies";
import { addProtocol } from "@/lib/mapper/utils";
import { format } from "date-fns";
import { CheckCircle2, Circle, ExternalLink, Mail } from "lucide-react";
import Link from "next/link";

interface FieldDisplayProps {
    fieldType: string;
    value: unknown;
    config?: Record<string, unknown>;
}

/**
 * Universal field display component
 * Renders the appropriate display based on field type
 */
export function FieldDisplay({ fieldType, value, config }: FieldDisplayProps) {
    if (value === null || value === undefined || value === "") {
        return <span className="text-muted-foreground italic">—</span>;
    }

    // TEXT CATEGORY
    if (fieldType === "text") {
        return <span>{String(value)}</span>;
    }

    if (fieldType === "long_text") {
        return <span className="whitespace-pre-wrap">{String(value)}</span>;
    }

    if (fieldType === "url") {
        const urlValue = String(value);
        // Value is already clean in database (no protocol)
        // Add https:// only when creating the clickable link
        const fullUrl = addProtocol(urlValue);

        return (
            <Link
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
            >
                {urlValue}
                <ExternalLink className="w-3 h-3" />
            </Link>
        );
    }

    if (fieldType === "email") {
        const emailValue = String(value);
        return (
            <a
                href={`mailto:${emailValue}`}
                className="text-primary hover:underline inline-flex items-center gap-1"
            >
                {emailValue}
                <Mail className="w-3 h-3" />
            </a>
        );
    }

    // NUMBERS CATEGORY
    if (fieldType === "number") {
        return <span>{parseFloat(String(value)).toLocaleString()}</span>;
    }

    if (fieldType === "currency") {
        const currencyValue = value as { amount: number; currency: string };
        if (typeof currencyValue === "object" && currencyValue.amount !== undefined) {
            return <span>{formatCurrency(currencyValue.amount, currencyValue.currency)}</span>;
        }
        return <span>{String(value)}</span>;
    }

    if (fieldType === "percentage") {
        const percentValue = Number(value);
        const percentConfig = config as { showProgressBar?: boolean } | undefined;
        return (
            <div className="flex items-center gap-2">
                <span>{percentValue}%</span>
                {percentConfig?.showProgressBar && (
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentValue}%` }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // DATE & TIME CATEGORY
    if (fieldType === "date") {
        try {
            const dateValue = typeof value === "number" ? value : Number(value);
            return <span>{format(new Date(dateValue), "MMM dd, yyyy")}</span>;
        } catch {
            return <span>{String(value)}</span>;
        }
    }

    if (fieldType === "datetime") {
        try {
            const dateValue = typeof value === "number" ? value : Number(value);
            return <span>{format(new Date(dateValue), "MMM dd, yyyy h:mm a")}</span>;
        } catch {
            return <span>{String(value)}</span>;
        }
    }

    // BOOLEAN CATEGORY
    if (fieldType === "checkbox") {
        const isChecked = Boolean(value);
        return (
            <div className="inline-flex items-center gap-1">
                {isChecked ? (
                    <>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Yes</ span>
                    </>
                ) : (
                    <>
                        <Circle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">No</span>
                    </>
                )}
            </div>
        );
    }

    // Default fallback
    return <span>{String(value)}</span>;
}
