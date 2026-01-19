/**
 * Mapper Field Type Definitions
 * Complete TypeScript types for all 42 field types
 */

import { Id } from "@convex/_generated/dataModel";

// ================================
// MAIN FIELD TYPE ENUM
// ================================

export type FieldType =
    // TEXT CATEGORY (6 types)
    | "text"
    | "long_text"
    | "rich_text"
    | "url"
    | "email"
    | "phone"
    // NUMBERS CATEGORY (4 types)
    | "number"
    | "currency"
    | "percentage"
    | "rating"
    // DATE & TIME CATEGORY (5 types)
    | "date"
    | "datetime"
    | "time"
    | "duration"
    | "timestamp"
    // SELECTION CATEGORY (4 types)
    | "dropdown"
    | "multiselect"
    | "status"
    | "tags"
    // BOOLEAN CATEGORY (2 types)
    | "checkbox"
    | "toggle"
    // LOCATION CATEGORY (4 types)
    | "location_name"
    | "location_map"
    | "coordinates"
    | "full_address"
    // MEDIA CATEGORY (4 types)
    | "file"
    | "document"
    | "image"
    | "video"
    // RELATION CATEGORY (3 types)
    | "user_reference"
    | "org_reference"
    | "custom_relation"
    // SPECIAL CATEGORY (6 types)
    | "formula"
    | "auto_number"
    | "barcode_qr"
    | "color_picker"
    | "json"
    | "markdown"
    // ADVANCED CATEGORY (4 types)
    | "lookup"
    | "rollup"
    | "button"
    | "collaboration";

// ================================
// FIELD CATEGORIES
// ================================

export type FieldCategory =
    | "text"
    | "numbers"
    | "date_time"
    | "selection"
    | "boolean"
    | "location"
    | "media"
    | "relation"
    | "special"
    | "advanced";

// ================================
// BASE FIELD DEFINITION
// ================================

export interface FieldDefinition {
    id: string;
    name: string;
    type: FieldType;
    required: boolean;
    config: FieldConfig;
    order: number;
}

// ================================
// FIELD VALUE TYPES
// ================================

export type FieldValue =
    | string
    | number
    | boolean
    | string[]
    | CurrencyValue
    | ImageValue
    | VideoValue
    | FileValue
    | LocationValue
    | DateTimeValue
    | DurationValue
    | CoordinatesValue
    | AddressValue
    | UserReferenceValue
    | OrgReferenceValue
    | RelationValue
    | FormulaValue
    | JsonValue
    | ButtonValue
    | null;

// ================================
// COMPLEX VALUE TYPES
// ================================

export interface CurrencyValue {
    amount: number;
    currency: string;
}

export interface ImageValue {
    url: string;
    fileName: string;
    fileSize: number;
    width?: number;
    height?: number;
    mimeType?: string;
}

export interface VideoValue {
    url: string;
    fileName: string;
    fileSize: number;
    duration?: number;
    thumbnail?: string;
    mimeType?: string;
}

export interface FileValue {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType?: string;
}

export interface LocationValue {
    name?: string;
    mapLink?: string;
    coordinates?: CoordinatesValue;
    address?: AddressValue;
}

export interface CoordinatesValue {
    lat: number;
    lng: number;
}

export interface AddressValue {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface DateTimeValue {
    timestamp: number; // Unix timestamp
    timezone?: string;
}

export interface DurationValue {
    hours: number;
    minutes: number;
    seconds?: number;
}

export interface UserReferenceValue {
    userId: Id<"users">;
    name?: string;
    image?: string;
}

export interface OrgReferenceValue {
    orgId: Id<"organizations">;
    name?: string;
    logo?: string;
}

export interface RelationValue {
    cardId: Id<"mapping_cards">;
    displayValue?: string;
}

export interface FormulaValue {
    result: string | number | boolean | null;
    error?: string;
}

export interface JsonValue {
    data: Record<string, unknown>;
}

export interface ButtonValue {
    label: string;
    action: ButtonAction;
}

export interface ButtonAction {
    type: "url" | "function" | "external";
    target: string;
    params?: Record<string, unknown>;
}

// ================================
// FIELD CONFIGURATION TYPES
// ================================

export type FieldConfig =
    | TextFieldConfig
    | LongTextFieldConfig
    | RichTextFieldConfig
    | UrlFieldConfig
    | EmailFieldConfig
    | PhoneFieldConfig
    | NumberFieldConfig
    | CurrencyFieldConfig
    | PercentageFieldConfig
    | RatingFieldConfig
    | DateFieldConfig
    | DateTimeFieldConfig
    | TimeFieldConfig
    | DurationFieldConfig
    | TimestampFieldConfig
    | DropdownFieldConfig
    | MultiselectFieldConfig
    | StatusFieldConfig
    | TagsFieldConfig
    | CheckboxFieldConfig
    | ToggleFieldConfig
    | LocationNameFieldConfig
    | LocationMapFieldConfig
    | CoordinatesFieldConfig
    | FullAddressFieldConfig
    | FileFieldConfig
    | DocumentFieldConfig
    | ImageFieldConfig
    | VideoFieldConfig
    | UserReferenceFieldConfig
    | OrgReferenceFieldConfig
    | CustomRelationFieldConfig
    | FormulaFieldConfig
    | AutoNumberFieldConfig
    | BarcodeQRFieldConfig
    | ColorPickerFieldConfig
    | JsonFieldConfig
    | MarkdownFieldConfig
    | LookupFieldConfig
    | RollupFieldConfig
    | ButtonFieldConfig
    | CollaborationFieldConfig;

// ================================
// TEXT CATEGORY CONFIGS
// ================================

export interface TextFieldConfig {
    maxLength?: number;
    placeholder?: string;
}

export interface LongTextFieldConfig {
    maxLength?: number;
    placeholder?: string;
    rows?: number;
}

export interface RichTextFieldConfig {
    allowedFormats?: ("bold" | "italic" | "underline" | "link" | "list")[];
    maxLength?: number;
}

export interface UrlFieldConfig {
    openInNewTab?: boolean;
    displayAsLink?: boolean;
}

export interface EmailFieldConfig {
    displayAsMailto?: boolean;
}

export interface PhoneFieldConfig {
    defaultCountryCode?: string;
    format?: "international" | "national";
}

// ================================
// NUMBERS CATEGORY CONFIGS
// ================================

export interface NumberFieldConfig {
    min?: number;
    max?: number;
    decimals?: number;
    allowNegative?: boolean;
}

export interface CurrencyFieldConfig {
    currency: string; // ISO code
    decimals: number;
    thousandSeparator: boolean;
    symbolPosition: "before" | "after";
}

export interface PercentageFieldConfig {
    min?: number;
    max?: number;
    decimals?: number;
    showProgressBar?: boolean;
}

export interface RatingFieldConfig {
    max: number;
    style: "stars" | "numbers" | "emojis";
    allowHalf?: boolean;
    emoji?: string;
}

// ================================
// DATE & TIME CATEGORY CONFIGS
// ================================

export interface DateFieldConfig {
    format?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    minDate?: number;
    maxDate?: number;
}

export interface DateTimeFieldConfig {
    dateFormat?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
    timeFormat?: "12h" | "24h";
    timezone?: string;
}

export interface TimeFieldConfig {
    format?: "12h" | "24h";
}

export interface DurationFieldConfig {
    format: "hours_minutes" | "hours_minutes_seconds";
}

export interface TimestampFieldConfig {
    autoUpdate?: boolean; // Update on every change
    showRelative?: boolean; // "2 hours ago"
}

// ================================
// SELECTION CATEGORY CONFIGS
// ================================

export interface DropdownFieldConfig {
    options: DropdownOption[];
    allowCustom?: boolean;
}

export interface MultiselectFieldConfig {
    options: DropdownOption[];
    allowCustom?: boolean;
    maxSelections?: number;
}

export interface StatusFieldConfig {
    options: StatusOption[];
}

export interface TagsFieldConfig {
    suggestions?: string[];
    maxTags?: number;
    allowCustom?: boolean;
}

export interface DropdownOption {
    id: string;
    label: string;
    color?: string;
}

export interface StatusOption {
    id: string;
    label: string;
    color: string;
    icon?: string;
}

// ================================
// BOOLEAN CATEGORY CONFIGS
// ================================

export interface CheckboxFieldConfig {
    defaultValue?: boolean;
}

export interface ToggleFieldConfig {
    defaultValue?: boolean;
    labels?: {
        on: string;
        off: string;
    };
}

// ================================
// LOCATION CATEGORY CONFIGS
// ================================

export interface LocationNameFieldConfig {
    placeholder?: string;
}

export interface LocationMapFieldConfig {
    provider?: "google" | "apple" | "osm";
}

export interface CoordinatesFieldConfig {
    format?: "decimal" | "dms"; // Decimal or Degrees-Minutes-Seconds
}

export interface FullAddressFieldConfig {
    countries?: string[]; // Restrict to specific countries
    autoComplete?: boolean;
}

// ================================
// MEDIA CATEGORY CONFIGS
// ================================

export interface FileFieldConfig {
    allowedTypes?: string[]; // MIME types
    maxSize?: number; // bytes
    multiple?: boolean;
}

export interface DocumentFieldConfig {
    allowedTypes?: string[]; // e.g., ["pdf", "docx", "txt"]
    maxSize?: number;
    multiple?: boolean;
}

export interface ImageFieldConfig {
    maxSize?: number;
    allowedFormats?: ("jpg" | "png" | "gif" | "webp")[];
    maxWidth?: number;
    maxHeight?: number;
    multiple?: boolean;
}

export interface VideoFieldConfig {
    maxSize?: number;
    allowedFormats?: ("mp4" | "webm" | "mov")[];
    multiple?: boolean;
}

// ================================
// RELATION CATEGORY CONFIGS
// ================================

export interface UserReferenceFieldConfig {
    multiple?: boolean;
    filterByOrg?: boolean;
}

export interface OrgReferenceFieldConfig {
    multiple?: boolean;
}

export interface CustomRelationFieldConfig {
    targetProjectId: Id<"mapping_projects">;
    multiple?: boolean;
    displayField?: string; // Which field to show from related card
}

// ================================
// SPECIAL CATEGORY CONFIGS
// ================================

export interface FormulaFieldConfig {
    formula: string;
    resultType: "text" | "number" | "boolean" | "date";
}

export interface AutoNumberFieldConfig {
    prefix?: string;
    suffix?: string;
    startFrom: number;
    increment: number;
}

export interface BarcodeQRFieldConfig {
    type: "barcode" | "qr";
    format?: "CODE128" | "EAN13" | "QR";
}

export interface ColorPickerFieldConfig {
    format?: "hex" | "rgb" | "hsl";
    allowAlpha?: boolean;
}

export interface JsonFieldConfig {
    schema?: Record<string, unknown>; // JSON Schema for validation
    formatted?: boolean;
}

export interface MarkdownFieldConfig {
    showPreview?: boolean;
    allowedElements?: string[];
}

// ================================
// ADVANCED CATEGORY CONFIGS
// ================================

export interface LookupFieldConfig {
    relationFieldId: string; // ID of the relation field
    targetFieldId: string; // Which field to lookup from related card
}

export interface RollupFieldConfig {
    relationFieldId: string;
    targetFieldId: string;
    aggregation: "count" | "sum" | "avg" | "min" | "max" | "concat";
}

export interface ButtonFieldConfig {
    label: string;
    action: ButtonAction;
    style?: "primary" | "secondary" | "danger";
    icon?: string;
}

export interface CollaborationFieldConfig {
    allowComments?: boolean;
    allowMentions?: boolean;
    showActivity?: boolean;
}
