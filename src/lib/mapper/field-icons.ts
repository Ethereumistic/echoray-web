/**
 * Field Type Icon Mappings
 * Maps each of the 42 field types to a Lucide React icon
 */

import {
    Type,
    AlignLeft,
    FileText,
    Link,
    Mail,
    Phone,
    Hash,
    DollarSign,
    Percent,
    Star,
    Calendar,
    Clock,
    Timer,
    Hourglass,
    ChevronDown,
    ListChecks,
    CircleDot,
    Tag,
    CheckSquare,
    ToggleLeft,
    MapPin,
    Map,
    Navigation,
    Home,
    File,
    FileType,
    Image,
    Video,
    User,
    Building,
    Link2,
    Calculator,
    Binary,
    QrCode,
    Palette,
    Braces,
    FileCode,
    Search,
    TrendingUp,
    MousePointerClick,
    MessageSquare,
    type LucideIcon,
} from "lucide-react";

import type { FieldType } from "./field-types";

/**
 * Icon mapping for all 42 field types
 */
export const FIELD_ICONS: Record<FieldType, LucideIcon> = {
    // TEXT CATEGORY (6 types)
    text: Type,
    long_text: AlignLeft,
    rich_text: FileText,
    url: Link,
    email: Mail,
    phone: Phone,

    // NUMBERS CATEGORY (4 types)
    number: Hash,
    currency: DollarSign,
    percentage: Percent,
    rating: Star,

    // DATE & TIME CATEGORY (5 types)
    date: Calendar,
    datetime: Calendar,
    time: Clock,
    duration: Timer,
    timestamp: Hourglass,

    // SELECTION CATEGORY (4 types)
    dropdown: ChevronDown,
    multiselect: ListChecks,
    status: CircleDot,
    tags: Tag,

    // BOOLEAN CATEGORY (2 types)
    checkbox: CheckSquare,
    toggle: ToggleLeft,

    // LOCATION CATEGORY (4 types)
    location_name: MapPin,
    location_map: Map,
    coordinates: Navigation,
    full_address: Home,

    // MEDIA CATEGORY (4 types)
    file: File,
    document: FileType,
    image: Image,
    video: Video,

    // RELATION CATEGORY (3 types)
    user_reference: User,
    org_reference: Building,
    custom_relation: Link2,

    // SPECIAL CATEGORY (6 types)
    formula: Calculator,
    auto_number: Binary,
    barcode_qr: QrCode,
    color_picker: Palette,
    json: Braces,
    markdown: FileCode,

    // ADVANCED CATEGORY (4 types)
    lookup: Search,
    rollup: TrendingUp,
    button: MousePointerClick,
    collaboration: MessageSquare,
};

/**
 * Get icon component for a field type
 */
export function getFieldIcon(fieldType: FieldType): LucideIcon {
    return FIELD_ICONS[fieldType] || Type;
}
