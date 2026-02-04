# Architecture Overview

This document provides a comprehensive overview of the HuggingFace Playground architecture, design patterns, and technical decisions.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Directory Structure](#directory-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [API Layer](#api-layer)
- [Styling System](#styling-system)
- [Testing Strategy](#testing-strategy)
- [Performance Optimizations](#performance-optimizations)
- [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
├─────────────────────────────────────────────────────────────────┤
│  Layout Components    │  Feature Components  │  UI Components   │
│  (Navigation, Theme)  │  (Datasets, Models)  │  (shadcn/ui)     │
├─────────────────────────────────────────────────────────────────┤
│                    Custom React Hooks                            │
│        (use-favorites, use-queries, use-achievements)           │
├─────────────────────────────────────────────────────────────────┤
│                    TanStack Query (React Query)                  │
│              (Server State, Caching, Background Sync)           │
├─────────────────────────────────────────────────────────────────┤
│                      API Service Layer                           │
│              (huggingface.ts - API abstraction)                 │
├─────────────────────────────────────────────────────────────────┤
│                  Cloudflare Pages Functions                      │
│              (API Proxy - CORS handling)                        │
├─────────────────────────────────────────────────────────────────┤
│                      HuggingFace APIs                            │
│        (huggingface.co/api, api-inference.huggingface.co)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Root Level

| Directory/File | Purpose                                           |
| -------------- | ------------------------------------------------- |
| `docs/`        | Project documentation (deployment, PRD, security) |
| `functions/`   | Cloudflare Pages Functions for API proxying       |
| `public/`      | Static assets (PWA icons, favicon)                |
| `scripts/`     | Build and utility scripts                         |
| `src/`         | Application source code                           |
| `tests/`       | End-to-end tests (Playwright)                     |

### Source Code Organization (`src/`)

```
src/
├── components/
│   ├── common/          # Shared components used across features
│   │   ├── FeaturedModal.tsx
│   │   ├── ReadmeViewer.tsx
│   │   └── TokenSettings.tsx
│   │
│   ├── features/        # Feature-specific components
│   │   ├── achievements/  # Gamification features
│   │   ├── comparison/    # Model comparison tool
│   │   ├── datasets/      # Dataset browser
│   │   ├── favorites/     # Favorites management
│   │   ├── learning/      # Learning resources
│   │   ├── models/        # Model explorer
│   │   ├── playground/    # API playground
│   │   └── trending/      # Trending content
│   │
│   ├── layout/          # App structure and navigation
│   │   ├── Navigation.tsx
│   │   ├── PageBreadcrumb.tsx
│   │   ├── QuickNav.tsx
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   │
│   └── ui/              # Base UI components (shadcn/ui)
│
├── hooks/               # Custom React hooks
│   ├── use-achievements.ts
│   ├── use-api-error.ts
│   ├── use-copy-to-clipboard.ts
│   ├── use-favorites.ts
│   ├── use-local-storage.ts
│   ├── use-mobile.ts
│   ├── use-navigation-history.ts
│   └── use-queries.ts
│
├── lib/                 # Utility functions
│   └── utils.ts
│
├── services/            # API service layer
│   └── huggingface.ts
│
├── styles/              # Global styles
│   └── theme.css
│
└── test/                # Test utilities
    └── setup.ts
```

---

## Component Architecture

### Component Categories

#### 1. Feature Components (`components/features/`)

Self-contained feature modules that encapsulate:

- Business logic for specific features
- Feature-specific state management
- API integrations

Each feature folder follows this pattern:

```
feature-name/
├── FeatureName.tsx       # Main feature component
├── FeatureName.test.tsx  # Component tests
├── SubComponent.tsx      # Feature-specific subcomponents
└── index.ts              # Barrel export
```

#### 2. Layout Components (`components/layout/`)

Components responsible for app structure:

- **Navigation** - Tab-based navigation with mobile support
- **PageBreadcrumb** - Hierarchical navigation context
- **QuickNav** - Keyboard shortcut navigation
- **ThemeProvider/Toggle** - Dark/light theme management

#### 3. Common Components (`components/common/`)

Shared components used across multiple features:

- **FeaturedModal** - Modal for featured content
- **ReadmeViewer** - Markdown rendering for READMEs
- **TokenSettings** - HuggingFace token configuration

#### 4. UI Components (`components/ui/`)

Base UI primitives from shadcn/ui:

- Built on Radix UI primitives
- Customizable via Tailwind CSS
- Accessible by default

---

## State Management

### Client State

**localStorage-based persistence** using custom hooks:

```typescript
// Example: useFavorites hook
const { favorites, addFavorite, removeFavorite } = useFavorites();
```

Key client state hooks:

- `use-local-storage.ts` - Generic localStorage abstraction
- `use-favorites.ts` - Favorites management
- `use-achievements.ts` - Gamification state
- `use-navigation-history.ts` - Browser-like history

### Server State

**TanStack Query (React Query)** for API data:

```typescript
// Example: useSearchModels query hook
const { data, isLoading, error } = useSearchModels(params);
```

Benefits:

- Automatic caching and background refetching
- Request deduplication
- Optimistic updates
- Built-in error/loading states

Query configuration (in `main.tsx`):

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## API Layer

### Service Architecture

The API service (`services/huggingface.ts`) provides:

- Type-safe API methods
- Consistent error handling
- Request/response transformation

### API Proxy (Cloudflare Functions)

Located in `functions/api/[[path]].ts`:

```
Browser Request          Cloudflare Function         HuggingFace API
    │                          │                           │
    ├──────/api/models────────►├─────────────────────────►│
    │                          │   (CORS handled)          │
    ◄──────────────────────────┤◄─────────────────────────┤
```

Proxy routes:

- `/api/*` → `https://huggingface.co/api/*`
- `/api/inference/*` → `https://api-inference.huggingface.co/models/*`

---

## Styling System

### Tailwind CSS v4

- Utility-first CSS framework
- Custom theme configuration in `tailwind.config.js`
- Theme variables in `styles/theme.css`

### Theming

Three theme modes supported:

- **Light** - Light color scheme
- **Dark** - Dark color scheme
- **System** - Follows OS preference

Theme managed by `next-themes` library and persisted to localStorage.

### Animation

- **Framer Motion** for complex animations
- **Tailwind transitions** for simple animations
- **CSS animations** for loading states

---

## Testing Strategy

### Unit Tests (Vitest)

Located alongside source files (`*.test.ts/tsx`):

```bash
npm run test      # Run tests
npm run test:ui   # Run with UI
npm run coverage  # Generate coverage report
```

Test categories:

- Component tests (React Testing Library)
- Hook tests
- Utility function tests

### End-to-End Tests (Playwright)

Located in `tests/e2e/`:

```bash
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run with UI
```

---

## Performance Optimizations

### Code Splitting

Lazy loading for feature components:

```typescript
const DatasetBrowser = lazyWithRetry(() =>
  import('@/components/features/datasets').then((m) => ({
    default: m.DatasetBrowser,
  }))
);
```

### Chunk Recovery

Custom `lazyWithRetry` function handles stale chunks after deployments:

- Detects chunk load failures
- Automatically refreshes page once
- Prevents infinite refresh loops

### Caching Strategies

1. **TanStack Query** - API response caching
2. **Service Worker** - Static asset caching (PWA)
3. **localStorage** - User preferences and favorites

### Bundle Analysis

View bundle composition:

```bash
npm run build
open dist/stats.html
```

---

## Deployment Architecture

### Cloudflare Pages

```
GitHub (main branch)
        │
        ▼
GitHub Actions (CI/CD)
        │
        ▼
Cloudflare Pages
        │
        ├── Static Assets (dist/)
        └── Edge Functions (functions/)
        │
        ▼
Custom Domain: hug.andernet.dev
```

### Environment Variables

| Variable                | Location       | Purpose                   |
| ----------------------- | -------------- | ------------------------- |
| `CLOUDFLARE_API_TOKEN`  | GitHub Secrets | Deployment authentication |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Secrets | Account identification    |
| `VITE_HF_TOKEN`         | Optional       | Default HuggingFace token |

For detailed deployment instructions, see [docs/DEPLOYMENT.md](DEPLOYMENT.md).

---

## Key Design Decisions

### 1. Feature-Based Organization

Components are organized by feature rather than type, making it easier to:

- Locate related code
- Understand feature boundaries
- Enable code ownership
- Facilitate lazy loading

### 2. Barrel Exports

Each directory has an `index.ts` that re-exports public API:

```typescript
// Import from feature barrel
import { DatasetBrowser } from '@/components/features/datasets';

// Instead of deep imports
import { DatasetBrowser } from '@/components/features/datasets/DatasetBrowser';
```

### 3. Path Aliases

TypeScript path aliases (`@/`) for clean imports:

```typescript
import { useFavorites } from '@/hooks/use-favorites';
```

### 4. Colocation

Tests are colocated with source files:

```
Component.tsx
Component.test.tsx
```

This keeps related code together and makes it easy to maintain.
