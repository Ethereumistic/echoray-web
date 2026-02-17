/**
 * Field Configuration Utilities
 * Default configs and metadata for all field types
 */

import type { FieldType, FieldCategory, FieldConfig } from "./field-types";
import { getDefaultCurrency } from "./currencies";

/**
 * Field type metadata
 */
export interface FieldTypeMetadata {
    type: FieldType;
    category: FieldCategory;
    label: string;
    description: string;
    isImplemented?: boolean;
    isPremium?: boolean; // For future premium features
    isAdvanced?: boolean; // Show in advanced section
}

/**
 * Complete field type metadata (all 42 types)
 */
export const FIELD_METADATA: Record<FieldType, FieldTypeMetadata> = {
    // TEXT CATEGORY
    text: {
        type: "text",
        category: "text",
        label: "Text",
        description: "Single line of text (max 255 characters)",
        isImplemented: true,
    },
    long_text: {
        type: "long_text",
        category: "text",
        label: "Long Text",
        description: "Multi-line text area for longer content",
        isImplemented: true,
    },
    rich_text: {
        type: "rich_text",
        category: "text",
        label: "Rich Text",
        description: "Formatted text with bold, italic, links, etc.",
    },
    url: {
        type: "url",
        category: "text",
        label: "URL",
        description: "Web links with validation",
        isImplemented: true,
    },
    email: {
        type: "email",
        category: "text",
        label: "Email",
        description: "Email addresses with validation",
        isImplemented: true,
    },
    phone: {
        type: "phone",
        category: "text",
        label: "Phone",
        description: "International phone numbers",
    },

    // NUMBERS CATEGORY
    number: {
        type: "number",
        category: "numbers",
        label: "Number",
        description: "Integers or decimal numbers",
        isImplemented: true,
    },
    currency: {
        type: "currency",
        category: "numbers",
        label: "Currency",
        description: "Money amounts with currency symbols",
        isImplemented: true,
    },
    percentage: {
        type: "percentage",
        category: "numbers",
        label: "Percentage",
        description: "Percentage values with progress bars",
        isImplemented: true,
    },
    rating: {
        type: "rating",
        category: "numbers",
        label: "Rating",
        description: "Star ratings or numeric scores",
    },

    // DATE & TIME CATEGORY
    date: {
        type: "date",
        category: "date_time",
        label: "Date",
        description: "Calendar dates",
        isImplemented: true,
    },
    datetime: {
        type: "datetime",
        category: "date_time",
        label: "Date & Time",
        description: "Specific date and time",
        isImplemented: true,
    },
    time: {
        type: "time",
        category: "date_time",
        label: "Time",
        description: "Time of day only",
    },
    duration: {
        type: "duration",
        category: "date_time",
        label: "Duration",
        description: "Time spans (e.g., 2h 30m)",
    },
    timestamp: {
        type: "timestamp",
        category: "date_time",
        label: "Timestamp",
        description: "Auto-generated creation/update time",
    },

    // SELECTION CATEGORY
    dropdown: {
        type: "dropdown",
        category: "selection",
        label: "Dropdown",
        description: "Single select from predefined options",
    },
    multiselect: {
        type: "multiselect",
        category: "selection",
        label: "Multi-Select",
        description: "Multiple selections from options",
    },
    status: {
        type: "status",
        category: "selection",
        label: "Status",
        description: "Workflow states with colors",
    },
    tags: {
        type: "tags",
        category: "selection",
        label: "Tags",
        description: "Freeform labels and keywords",
    },

    // BOOLEAN CATEGORY
    checkbox: {
        type: "checkbox",
        category: "boolean",
        label: "Checkbox",
        description: "Yes/No or True/False",
        isImplemented: true,
    },
    toggle: {
        type: "toggle",
        category: "boolean",
        label: "Toggle",
        description: "On/Off switch",
    },

    // LOCATION CATEGORY
    location_name: {
        type: "location_name",
        category: "location",
        label: "Location Name",
        description: "Text-based location",
    },
    location_map: {
        type: "location_map",
        category: "location",
        label: "Map Link",
        description: "Google/Apple Maps link",
    },
    coordinates: {
        type: "coordinates",
        category: "location",
        label: "Coordinates",
        description: "Latitude and longitude",
    },
    full_address: {
        type: "full_address",
        category: "location",
        label: "Full Address",
        description: "Complete mailing address",
    },

    // MEDIA CATEGORY
    file: {
        type: "file",
        category: "media",
        label: "File",
        description: "Any file type upload",
    },
    document: {
        type: "document",
        category: "media",
        label: "Document",
        description: "PDFs, Word docs, spreadsheets",
    },
    image: {
        type: "image",
        category: "media",
        label: "Image",
        description: "Images with preview",
    },
    video: {
        type: "video",
        category: "media",
        label: "Video",
        description: "Videos with player",
    },

    // RELATION CATEGORY
    user_reference: {
        type: "user_reference",
        category: "relation",
        label: "User Reference",
        description: "Link to platform users",
    },
    org_reference: {
        type: "org_reference",
        category: "relation",
        label: "Organization Reference",
        description: "Link to organizations",
    },
    custom_relation: {
        type: "custom_relation",
        category: "relation",
        label: "Custom Relation",
        description: "Link to cards in other projects",
    },

    // SPECIAL CATEGORY
    formula: {
        type: "formula",
        category: "special",
        label: "Formula",
        description: "Calculated values from other fields",
        isAdvanced: true,
    },
    auto_number: {
        type: "auto_number",
        category: "special",
        label: "Auto Number",
        description: "Auto-incrementing IDs",
    },
    barcode_qr: {
        type: "barcode_qr",
        category: "special",
        label: "Barcode/QR Code",
        description: "Generate and scan barcodes",
    },
    color_picker: {
        type: "color_picker",
        category: "special",
        label: "Color Picker",
        description: "Color selection",
    },
    json: {
        type: "json",
        category: "special",
        label: "JSON",
        description: "Structured data objects",
        isAdvanced: true,
    },
    markdown: {
        type: "markdown",
        category: "special",
        label: "Markdown",
        description: "Markdown with preview",
    },

    // ADVANCED CATEGORY
    lookup: {
        type: "lookup",
        category: "advanced",
        label: "Lookup",
        description: "Pull values from related cards",
        isAdvanced: true,
    },
    rollup: {
        type: "rollup",
        category: "advanced",
        label: "Rollup",
        description: "Aggregate data from multiple cards",
        isAdvanced: true,
    },
    button: {
        type: "button",
        category: "advanced",
        label: "Button",
        description: "Trigger actions",
        isAdvanced: true,
    },
    collaboration: {
        type: "collaboration",
        category: "advanced",
        label: "Collaboration",
        description: "Comments and activity log",
    },
};

/**
 * Get default configuration for a field type
 */
export function getDefaultFieldConfig(fieldType: FieldType): FieldConfig {
    switch (fieldType) {
        // TEXT CATEGORY
        case "text":
            return { maxLength: 255, placeholder: "Enter text..." };
        case "long_text":
            return { maxLength: 5000, placeholder: "Enter text...", rows: 4 };
        case "rich_text":
            return {
                allowedFormats: ["bold", "italic", "underline", "link", "list"],
                maxLength: 10000,
            };
        case "url":
            return { openInNewTab: true, displayAsLink: true };
        case "email":
            return { displayAsMailto: true };
        case "phone":
            return { defaultCountryCode: "US", format: "international" };

        // NUMBERS CATEGORY
        case "number":
            return { decimals: 0, allowNegative: true };
        case "currency":
            return {
                currency: getDefaultCurrency(),
                decimals: 2,
                thousandSeparator: true,
                symbolPosition: "before",
            };
        case "percentage":
            return {
                min: 0,
                max: 100,
                decimals: 0,
                showProgressBar: true,
            };
        case "rating":
            return {
                max: 5,
                style: "stars",
                allowHalf: false,
            };

        // DATE & TIME CATEGORY
        case "date":
            return { format: "MM/DD/YYYY" };
        case "datetime":
            return { dateFormat: "MM/DD/YYYY", timeFormat: "12h" };
        case "time":
            return { format: "12h" };
        case "duration":
            return { format: "hours_minutes" };
        case "timestamp":
            return { autoUpdate: false, showRelative: true };

        // SELECTION CATEGORY
        case "dropdown":
            return {
                options: [
                    { id: "option1", label: "Option 1" },
                    { id: "option2", label: "Option 2" },
                    { id: "option3", label: "Option 3" },
                ],
                allowCustom: false,
            };
        case "multiselect":
            return {
                options: [
                    { id: "option1", label: "Option 1" },
                    { id: "option2", label: "Option 2" },
                    { id: "option3", label: "Option 3" },
                ],
                allowCustom: false,
            };
        case "status":
            return {
                options: [
                    { id: "not_started", label: "Not Started", color: "#gray" },
                    { id: "in_progress", label: "In Progress", color: "#blue" },
                    { id: "completed", label: "Completed", color: "#green" },
                ],
            };
        case "tags":
            return { allowCustom: true };

        // BOOLEAN CATEGORY
        case "checkbox":
            return { defaultValue: false };
        case "toggle":
            return { defaultValue: false, labels: { on: "On", off: "Off" } };

        // LOCATION CATEGORY
        case "location_name":
            return { placeholder: "Enter location..." };
        case "location_map":
            return { provider: "google" };
        case "coordinates":
            return { format: "decimal" };
        case "full_address":
            return { autoComplete: true };

        // MEDIA CATEGORY
        case "file":
            return { maxSize: 10 * 1024 * 1024, multiple: false }; // 10MB
        case "document":
            return {
                allowedTypes: ["pdf", "docx", "xlsx", "txt"],
                maxSize: 10 * 1024 * 1024,
                multiple: false,
            };
        case "image":
            return {
                allowedFormats: ["jpg", "png", "gif", "webp"],
                maxSize: 5 * 1024 * 1024, // 5MB
                multiple: false,
            };
        case "video":
            return {
                allowedFormats: ["mp4", "webm"],
                maxSize: 50 * 1024 * 1024, // 50MB
                multiple: false,
            };

        // RELATION CATEGORY
        case "user_reference":
            return { multiple: false, filterByOrg: false };
        case "org_reference":
            return { multiple: false };
        case "custom_relation":
            return {
                targetProjectId: "" as never, // Must be set by user
                multiple: false,
            };

        // SPECIAL CATEGORY
        case "formula":
            return { formula: "", resultType: "text" };
        case "auto_number":
            return { prefix: "", suffix: "", startFrom: 1, increment: 1 };
        case "barcode_qr":
            return { type: "qr", format: "QR" };
        case "color_picker":
            return { format: "hex", allowAlpha: false };
        case "json":
            return { formatted: true };
        case "markdown":
            return { showPreview: true };

        // ADVANCED CATEGORY
        case "lookup":
            return {
                relationFieldId: "",
                targetFieldId: "",
            };
        case "rollup":
            return {
                relationFieldId: "",
                targetFieldId: "",
                aggregation: "count",
            };
        case "button":
            return {
                label: "Click me",
                action: { type: "url", target: "" },
                style: "primary",
            };
        case "collaboration":
            return {
                allowComments: true,
                allowMentions: true,
                showActivity: true,
            };

        default:
            return {} as FieldConfig;
    }
}

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: FieldCategory): FieldType[] {
    return Object.values(FIELD_METADATA)
        .filter((meta) => meta.category === category)
        .map((meta) => meta.type);
}

/**
 * Get all field categories
 */
export function getAllCategories(): FieldCategory[] {
    return [
        "text",
        "numbers",
        "date_time",
        "selection",
        "boolean",
        "location",
        "media",
        "relation",
        "special",
        "advanced",
    ];
}
