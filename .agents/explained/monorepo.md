# Echoray Monorepo Architecture

This document explains the architecture and configuration of the Echoray monorepo, focusing on the Tailwind CSS v4 and shadcn/ui integration.

## Directory Structure

```
echoray-mono/
├── apps/
│   └── web/                          # Main Next.js application
│       ├── src/
│       │   └── app/
│       │       ├── styles.css        # App-level CSS entry point
│       │       └── layout.tsx        # Root layout
│       ├── components.json           # shadcn/ui config (references ui package)
│       ├── postcss.config.mjs        # PostCSS config for Tailwind v4
│       └── package.json
├── packages/
│   └── ui/                           # Shared UI component library
│       ├── src/
│       │   ├── components/ui/        # shadcn/ui components
│       │   ├── lib/utils.ts          # Utility functions (cn, etc.)
│       │   ├── hooks/                # Shared hooks
│       │   └── styles/
│       │       └── globals.css       # Theme variables & design tokens
│       ├── index.tsx                 # Main exports
│       ├── components.json           # shadcn/ui config for ui package
│       ├── postcss.config.mjs        # PostCSS config
│       ├── tsconfig.json             # TypeScript config
│       └── package.json              # Package exports definition
└── package.json                      # Root package.json (workspace config)
```

## Key Configuration Files

### 1. packages/ui/package.json

Defines the package exports for the UI library:

```json
{
  "name": "@echoray/ui",
  "exports": {
    ".": "./index.tsx",
    "./components/ui/*": "./src/components/ui/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./hooks/*": "./src/hooks/*.ts",
    "./styles/globals.css": "./src/styles/globals.css",
    "./src/styles/globals.css": "./src/styles/globals.css"
  }
}
```

**Important:** Both `./styles/globals.css` and `./src/styles/globals.css` paths are exported to handle different import styles. Tailwind v4's PostCSS plugin requires CSS files to be properly exported.

### 2. packages/ui/src/styles/globals.css

Contains all design tokens and theme variables:

```css
@import "tailwindcss";
@import "tw-animate-css";

@source "../**/*.{ts,tsx}";

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(0.994 0 0);
  --foreground: oklch(0 0 0);
  /* ... more design tokens */
}

.dark {
  /* Dark mode overrides */
}

@theme inline {
  --color-background: var(--background);
  /* ... theme mappings */
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Key elements:**

- `@import "tailwindcss"` - Imports Tailwind CSS v4
- `@import "tw-animate-css"` - Animation utilities (replaces `tailwindcss-animate`)
- `@source "../**/*.{ts,tsx}"` - Tells Tailwind where to scan for class usage
- `@custom-variant dark` - Custom dark mode variant
- `:root` and `.dark` - CSS custom properties for theming
- `@theme inline` - Maps CSS variables to Tailwind theme values

### 3. apps/web/src/app/styles.css

The app-level CSS entry point:

```css
@import "tailwindcss";
@import "@echoray/ui/styles/globals.css";

@source "../../../../packages/ui/src/**/*.{ts,tsx,js,jsx}";
```

**Why this structure:**

- Imports Tailwind CSS first (required at app level)
- Imports the UI package's globals.css with theme variables
- `@source` directive tells Tailwind to scan the UI package for class usage

### 4. apps/web/src/app/layout.tsx

```tsx
import "./styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans dark antialiased">{children}</body>
    </html>
  );
}
```

### 5. apps/web/components.json

shadcn/ui configuration pointing to the UI package:

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

### 6. packages/ui/components.json

shadcn/ui configuration for the UI package itself:

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@echoray/ui/components",
    "utils": "@echoray/ui/lib/utils",
    "hooks": "@echoray/ui/hooks",
    "lib": "@echoray/ui/lib",
    "ui": "@echoray/ui/components/ui"
  }
}
```

## Animation System (tw-animate-css)

Tailwind v4 uses `tw-animate-css` instead of `tailwindcss-animate`. Key animations:

### Accordion

```tsx
// accordion.tsx
<AccordionPrimitive.Content
  className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
>
```

The animation classes are defined in `tw-animate-css`:

- `animate-accordion-down` - Expands accordion content
- `animate-accordion-up` - Collapses accordion content

These animations use CSS keyframes that read the `--radix-accordion-content-height` variable set by Radix UI.

### Navigation Menu

```tsx
// navigation-menu.tsx
<NavigationMenuPrimitive.Content
  className="data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out"
>
```

### Sidebar

The sidebar uses CSS custom properties for width:

```tsx
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "4rem"

<div style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON }}>
```

## Component Usage Patterns

### Importing Components

```tsx
// From the UI package
import { Button } from "@echoray/ui/components/ui/button";
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from "@echoray/ui/components/ui/sidebar";
import { cn } from "@echoray/ui/lib/utils";
```

### Using the Index Export

```tsx
// packages/ui/index.tsx exports all components
import { Button, Accordion, Sidebar } from "@echoray/ui";
```

## Common Issues & Solutions

### 1. CSS Not Exported Error

```
"./src/styles/globals.css" is not exported under the condition "style"
```

**Solution:** Ensure `package.json` exports include both paths:

```json
"./styles/globals.css": "./src/styles/globals.css",
"./src/styles/globals.css": "./src/styles/globals.css"
```

### 2. Animations Not Working

**Cause:** Missing `@import "tw-animate-css"` in globals.css
**Solution:** Add the import before theme definitions

### 3. Styles Not Applied to UI Package Components

**Cause:** Missing `@source` directive
**Solution:** Add `@source` pointing to the UI package in the app's styles.css:

```css
@source "../../../../packages/ui/src/**/*.{ts,tsx,js,jsx}";
```

### 4. Dark Mode Not Working

**Cause:** Missing `@custom-variant dark`
**Solution:** Add to globals.css:

```css
@custom-variant dark (&:is(.dark *));
```

## Dependency Requirements

### packages/ui/package.json

```json
{
  "dependencies": {
    "tw-animate-css": "^1.4.0"
    // ... radix-ui components
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

### apps/web/package.json

```json
{
  "dependencies": {
    "@echoray/ui": "workspace:*"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

## PostCSS Configuration

Both the UI package and app need `postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

## Adding New shadcn/ui Components

1. Run from the `apps/web` directory:

   ```bash
   pnpm dlx shadcn@latest add [component-name]
   ```

2. The component will be added to `packages/ui/src/components/ui/`

3. Export from `packages/ui/index.tsx`:
   ```tsx
   export * from "./src/components/ui/[component-name]";
   ```

## Best Practices

1. **Keep theme variables in the UI package** - Single source of truth for design tokens
2. **Use workspace protocol** - `"@echoray/ui": "workspace:*"` ensures local development
3. **Export CSS explicitly** - Both paths for flexibility
4. **Scan all sources** - `@source` directive must cover all component files
5. **Maintain consistent shadcn config** - Same style, baseColor, and cssVariables in both `components.json` files

## References

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Monorepo Guide](https://ui.shadcn.com/docs/monorepo)
- [tw-animate-css Repository](https://github.com/Wombosvideo/tw-animate-css)
- [Next Forge Template](https://www.next-forge.com/)
