/**
 * Clipboard and Parsing Utilities for Mapper Table
 */

import { parse } from "date-fns";
import { type FieldType, type FieldConfig, type FieldValue, type CurrencyFieldConfig } from "./field-types";
import { CURRENCIES } from "./currencies";

/**
 * Parses tab-separated value string from clipboard
 */
export function parseClipboardData(data: string): string[][] {
    if (!data) return [];

    // Split by lines, then by tabs
    return data.split(/\r?\n/).filter(line => line.length > 0).map(row => row.split('\t'));
}

/**
 * Converts a raw string value from clipboard to the appropriate field value type
 */
export function parseFieldValue(value: string, type: FieldType, config?: FieldConfig): FieldValue {
    const trimmed = value.trim();
    if (!trimmed) return null;

    switch (type) {
        case "number":
            // Strip everything except numbers, decimal point and minus sign
            const num = parseFloat(trimmed.replace(/[^0-9.-]/g, ''));
            return isNaN(num) ? 0 : num;

        case "percentage":
            const percent = parseFloat(trimmed.replace(/[^0-9.-]/g, ''));
            return isNaN(percent) ? 0 : percent;

        case "checkbox":
            const lower = trimmed.toLowerCase();
            return ['true', 'yes', '1', 'checked', 'x', 'v'].includes(lower);

        case "date":
        case "datetime":
            // Try common date formats
            const formats = [
                "dd.MM.yyyy",
                "MM/dd/yyyy",
                "yyyy-MM-dd",
                "dd/MM/yyyy",
                "MMM dd, yyyy",
                "MMMM dd, yyyy"
            ];

            for (const f of formats) {
                try {
                    const parsedDate = parse(trimmed, f, new Date());
                    if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
                } catch {
                    // Continue to next format
                }
            }

            // Fallback to native Date.parse
            const ts = Date.parse(trimmed);
            if (!isNaN(ts)) return ts;

            return null;

        case "currency":
            // Parse amount and try to detect currency symbol
            const amount = parseFloat(trimmed.replace(/[^0-9.-]/g, ''));
            if (isNaN(amount)) return null;

            // Default to USD or config currency
            const currencyConfig = config as CurrencyFieldConfig;
            let currencyCode = currencyConfig?.currency || "USD";

            // Detect common currency symbols in the string
            const symbols: Record<string, string> = {
                '€': 'EUR',
                '$': 'USD',
                '£': 'GBP',
                '¥': 'JPY',
                'zł': 'PLN',
                'kr': 'SEK', // Or NOK/DKK, but we'll guess
            };

            for (const [symbol, code] of Object.entries(symbols)) {
                if (trimmed.includes(symbol)) {
                    currencyCode = code;
                    break;
                }
            }

            // Also check CURRENCIES list for symbols
            if (currencyCode === (currencyConfig?.currency || "USD")) {
                const found = CURRENCIES.find(c => trimmed.includes(c.symbol));
                if (found) currencyCode = found.code;
            }

            return { amount, currency: currencyCode };

        case "url":
            // Basic URL cleaning if needed
            return trimmed;

        case "email":
            return trimmed;

        default:
            return trimmed;
    }
}

/**
 * Formats a field value into a string suitable for copying to clipboard (TSV)
 */
export function formatFieldValueForClipboard(value: unknown, type: FieldType): string {
    if (value === null || value === undefined) return "";

    switch (type) {
        case "currency":
            const cv = value as { amount: number; currency: string };
            if (typeof cv === 'object' && cv.amount !== undefined) {
                const symbol = CURRENCIES.find(c => c.code === cv.currency)?.symbol || cv.currency;
                return `${cv.amount} ${symbol}`;
            }
            return String(value);

        case "date":
        case "datetime":
            try {
                const date = new Date(Number(value));
                return date.toLocaleDateString();
            } catch {
                return String(value);
            }

        case "checkbox":
            return value ? "Yes" : "No";

        default:
            return String(value);
    }
}
