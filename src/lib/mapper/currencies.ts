/**
 * Currency Definitions for Mapper Currency Field
 */

export interface Currency {
    code: string;
    name: string;
    symbol: string;
    decimals: number;
    symbolPosition: "before" | "after";
}

export const CURRENCIES: Currency[] = [
    // Major currencies
    { code: "USD", name: "US Dollar", symbol: "$", decimals: 2, symbolPosition: "before" },
    { code: "EUR", name: "Euro", symbol: "€", decimals: 2, symbolPosition: "before" },
    { code: "GBP", name: "British Pound", symbol: "£", decimals: 2, symbolPosition: "before" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0, symbolPosition: "before" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimals: 2, symbolPosition: "before" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2, symbolPosition: "before" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimals: 2, symbolPosition: "before" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr", decimals: 2, symbolPosition: "before" },

    // European currencies
    { code: "SEK", name: "Swedish Krona", symbol: "kr", decimals: 2, symbolPosition: "after" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimals: 2, symbolPosition: "after" },
    { code: "DKK", name: "Danish Krone", symbol: "kr", decimals: 2, symbolPosition: "after" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł", decimals: 2, symbolPosition: "after" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč", decimals: 2, symbolPosition: "after" },
    { code: "HUF", name: "Hungarian Forint", symbol: "Ft", decimals: 0, symbolPosition: "after" },

    // Asia-Pacific
    { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2, symbolPosition: "before" },
    { code: "KRW", name: "South Korean Won", symbol: "₩", decimals: 0, symbolPosition: "before" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2, symbolPosition: "before" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimals: 2, symbolPosition: "before" },
    { code: "TWD", name: "Taiwan Dollar", symbol: "NT$", decimals: 0, symbolPosition: "before" },
    { code: "THB", name: "Thai Baht", symbol: "฿", decimals: 2, symbolPosition: "before" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimals: 2, symbolPosition: "before" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", decimals: 0, symbolPosition: "before" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱", decimals: 2, symbolPosition: "before" },

    // Americas
    { code: "MXN", name: "Mexican Peso", symbol: "$", decimals: 2, symbolPosition: "before" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2, symbolPosition: "before" },
    { code: "ARS", name: "Argentine Peso", symbol: "$", decimals: 2, symbolPosition: "before" },
    { code: "CLP", name: "Chilean Peso", symbol: "$", decimals: 0, symbolPosition: "before" },
    { code: "COP", name: "Colombian Peso", symbol: "$", decimals: 0, symbolPosition: "before" },

    // Middle East & Africa
    { code: "AED", name: "UAE Dirham", symbol: "د.إ", decimals: 2, symbolPosition: "before" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼", decimals: 2, symbolPosition: "before" },
    { code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2, symbolPosition: "before" },
    { code: "ILS", name: "Israeli Shekel", symbol: "₪", decimals: 2, symbolPosition: "before" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺", decimals: 2, symbolPosition: "before" },

    // Others
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimals: 2, symbolPosition: "before" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽", decimals: 2, symbolPosition: "after" },
];

/**
 * Get currency by code
 */
export function getCurrency(code: string): Currency | undefined {
    return CURRENCIES.find((c) => c.code === code);
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currencyCode: string): string {
    const currency = getCurrency(currencyCode);
    if (!currency) return `${amount} ${currencyCode}`;

    const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: currency.decimals,
        maximumFractionDigits: currency.decimals,
    }).format(amount);

    return currency.symbolPosition === "before"
        ? `${currency.symbol}${formatted}`
        : `${formatted} ${currency.symbol}`;
}

/**
 * Get default currency based on locale
 */
export function getDefaultCurrency(): string {
    const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";

    const currencyMap: Record<string, string> = {
        "en-US": "USD",
        "en-GB": "GBP",
        "en-CA": "CAD",
        "en-AU": "AUD",
        "en-NZ": "NZD",
        "de": "EUR",
        "fr": "EUR",
        "es": "EUR",
        "it": "EUR",
        "nl": "EUR",
        "ja": "JPY",
        "zh": "CNY",
        "ko": "KRW",
        "pt-BR": "BRL",
        "ru": "RUB",
        "tr": "TRY",
        "pl": "PLN",
        "sv": "SEK",
        "no": "NOK",
        "da": "DKK",
    };

    for (const [key, value] of Object.entries(currencyMap)) {
        if (locale.startsWith(key)) {
            return value;
        }
    }

    return "USD"; // Default fallback
}
