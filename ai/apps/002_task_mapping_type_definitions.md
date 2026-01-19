# Task 002: TypeScript Type Definitions

**Status:** Not Started  
**Priority:** Critical  
**Estimated Time:** 3 hours  
**Dependencies:** Task 001  

## Objective

Create comprehensive TypeScript type definitions for all 42 field types, configurations, and validation schemas.

## Deliverables

- [ ] Create `lib/mapper/field-types.ts` with all type definitions
- [ ] Create `lib/mapper/field-config.ts` with configuration schemas
- [ ] Create `lib/mapper/field-icons.ts` with icon mappings
- [ ] Create `lib/mapper/currencies.ts` with currency definitions

## Field Type Definitions

### Core Types

```typescript
// Main field type enum
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

// Field category grouping
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
```

### Field Configuration Types

```typescript
// Base field definition
export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  config: FieldConfig;
  order: number;
}

// Configuration union type
export type FieldConfig =
  | TextFieldConfig
  | NumberFieldConfig
  | CurrencyFieldConfig
  | DropdownFieldConfig
  | StatusFieldConfig
  // ... other config types
  ;

// Example: Currency field config
export interface CurrencyFieldConfig {
  currency: string; // "USD", "EUR", etc.
  decimals: number; // 0, 2, 4
  thousandSeparator: boolean;
  symbol: "before" | "after";
}

// Example: Dropdown field config
export interface DropdownFieldConfig {
  options: Array<{
    id: string;
    label: string;
    color?: string;
  }>;
  allowCustom: boolean;
}
```

### Field Value Types

```typescript
// Value storage types
export type FieldValue =
  | string
  | number
  | boolean
  | Date
  | CurrencyValue
  | ImageValue
  | LocationValue
  | null;

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
}

export interface LocationValue {
  name?: string;
  mapLink?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}
```

## Currency Definitions

Create `lib/mapper/currencies.ts`:

```typescript
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0 },
  // ... Add all 20+ currencies
];
```

## Field Icons

Create `lib/mapper/field-icons.ts`:

```typescript
import { 
  Type, 
  AlignLeft, 
  Hash, 
  Calendar,
  // ... other lucide icons
} from "lucide-react";

export const FIELD_ICONS: Record<FieldType, React.ComponentType> = {
  text: Type,
  long_text: AlignLeft,
  number: Hash,
  date: Calendar,
  // ... all 42 mappings
};
```

## Implementation Steps

1. Create `lib/mapper/field-types.ts`
2. Create `lib/mapper/field-config.ts`
3. Create `lib/mapper/currencies.ts`
4. Create `lib/mapper/field-icons.ts`
5. Export all from `lib/mapper/index.ts`

## Testing

- [ ] All types compile without errors
- [ ] Type inference works correctly
- [ ] Icons render properly

## Notes

- Use strict TypeScript typing
- Export all types for use in components
- Keep field configs extensible for future features
