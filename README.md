# 🤗 HuggingFace Playground

> An interactive learning platform for exploring HuggingFace's ecosystem — browse datasets, discover models, and experiment with AI APIs in a beautifully crafted interface.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/tests-44%20passing-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/coverage-73%25-green)](https://vitest.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<p align="center">
  <strong>🎯 Educational</strong> • <strong>🔍 Explorative</strong> • <strong>⚡ Practical</strong>
</p>

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Building](#-building)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Documentation](#-documentation)
- [License](#-license)

---

## ✨ Features

### Core Functionality

- 🗂️ **Dataset Browser** — Search and explore thousands of HuggingFace datasets with advanced filtering by task, language, and size. View detailed metadata, sample data, and usage examples.

- 🤖 **Model Explorer** — Discover pre-trained AI models with filters for task type, framework, and popularity. Access comprehensive model cards with code snippets and integration guides.

- 🧪 **API Playground** — Interactive environment to test the HuggingFace Inference API. Input data, execute requests in real-time, and see formatted responses with code examples.

- ⚖️ **Model Comparison** — Compare multiple models side-by-side to evaluate capabilities, performance metrics, and choose the best fit for your use case.

- ⭐ **Favorites System** — Save and organize your preferred datasets and models. Add personal notes to track why you saved each item. All favorites persist across sessions.

- 📚 **Learning Resources** — Curated collection of guides, documentation, and best practices. Contextual help throughout the app to accelerate learning.

- 🏆 **Achievements** — Gamified tracking system that rewards exploration milestones. Track experiment counts, daily streaks, and unlock badges as you learn.

- 📊 **Trending Section** — Discover what's popular in the HuggingFace community. See trending models and datasets with statistics.

### Technical Features

- 📱 **Progressive Web App (PWA)** — Install as a standalone application on desktop or mobile. Works offline with intelligent caching.

- 🎨 **Adaptive Theming** — Light, dark, and system-adaptive themes with smooth transitions. Theme preferences persist automatically.

- ⚡ **Performance Optimized** — Code splitting, lazy loading, and optimized bundle size. Rollup visualizer for bundle analysis.

- 🔒 **Secure Token Storage** — HuggingFace API tokens stored securely in browser localStorage. Optional server-side configuration.

- 🌐 **CORS Proxy** — Cloudflare Pages Functions handle API requests, eliminating CORS issues.

- ♿ **Accessible** — Built with accessibility in mind using shadcn/ui components and proper ARIA attributes.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/andernet/huggingface.git
cd huggingface

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** — v20.x or higher ([download](https://nodejs.org/))
- **npm** — v10.x or higher (comes with Node.js)
- **Git** — For version control ([download](https://git-scm.com/))

### Optional

- **HuggingFace Account** — For API access ([sign up](https://huggingface.co/join))
- **Cloudflare Account** — For deployment ([sign up](https://dash.cloudflare.com/sign-up))

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/andernet/huggingface.git
cd huggingface
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19 and TypeScript
- Vite build tool
- Tailwind CSS v4
- TanStack Query for state management
- shadcn/ui component library
- Development and testing tools

### 3. Verify Installation

```bash
# Check if all dependencies installed correctly
npm run type-check
```

---

## ⚙️ Configuration

### HuggingFace API Token

The application works without an API token, but some features require authentication:

#### Option 1: In-App Settings (Recommended)

1. Visit [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Create a new token with `read` access
3. Click the gear icon (⚙️) in the app navigation
4. Enter your API token
5. Token is stored securely in localStorage

#### Option 2: Environment Variable

Create a `.env` file in the project root:

```bash
VITE_HF_TOKEN=hf_your_token_here
```

> **Note:** Tokens in `.env` are embedded in the build. For production deployments, use Cloudflare environment variables (see [Deployment Guide](docs/DEPLOYMENT.md)).

---

## 💻 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173) with:
- ⚡ Hot Module Replacement (HMR)
- 🔄 Automatic browser refresh on file changes
- 🐛 Source maps for debugging

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build for production with TypeScript compilation |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without changes |
| `npm run type-check` | Run TypeScript type checking without emitting files |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:ui` | Open Vitest UI for interactive testing |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run test:e2e:ui` | Open Playwright UI for interactive E2E testing |
| `npm run coverage` | Generate and view test coverage report |
| `npm run generate-og` | Generate Open Graph social sharing images |
| `npm run clean` | Remove build artifacts and cache |
| `npm run optimize` | Optimize Vite dependencies |

### Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make Your Changes**
   - Follow the existing code style
   - Write tests for new features
   - Update documentation as needed

3. **Run Quality Checks**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Commit and Push**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feat/your-feature-name
   ```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🧪 Testing

The project uses a comprehensive testing strategy with multiple layers:

### Unit Testing (Vitest)

Test individual functions, hooks, and utilities:

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run coverage
```

**Coverage Thresholds:**
- Statements: 70%
- Branches: 70%
- Functions: 50%
- Lines: 70%

**Test Files:**
- `src/hooks/*.test.ts` — Custom React hooks
- `src/lib/*.test.ts` — Utility functions
- `src/services/*.test.ts` — API service layer

### End-to-End Testing (Playwright)

Test complete user workflows:

```bash
# Run E2E tests headless
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test file
npx playwright test achievements
```

**E2E Test Coverage:**
- Achievement system and gamification
- Playground API interactions
- User flows and navigation

### View Coverage Report

After running `npm run coverage`, open the HTML report:

```bash
open coverage/index.html
```

---

## 🏗️ Building

### Production Build

```bash
npm run build
```

This creates an optimized production bundle in the `dist/` directory:
- TypeScript compilation with type checking
- Minified and tree-shaken JavaScript
- CSS optimization and purging
- Asset optimization and compression
- Source maps for debugging

### Build Output

```
dist/
├── assets/           # Compiled JS, CSS, and static assets
├── index.html        # Main HTML entry point
├── manifest.json     # PWA manifest
├── sw.js            # Service Worker for offline support
└── stats.html       # Bundle size visualization
```

### Analyze Bundle Size

```bash
npm run build
open dist/stats.html
```

The stats page shows:
- Bundle composition by module
- Largest dependencies
- Chunk sizes and optimization opportunities

### Preview Production Build

```bash
npm run preview
```

Serves the production build locally at [http://localhost:4173](http://localhost:4173) to test before deployment.

---

## 🏗️ Project Structure

```
huggingface/
├── docs/                       # 📚 Documentation
│   ├── ARCHITECTURE.md         # Technical architecture and design patterns
│   ├── DEPLOYMENT.md           # Cloudflare Pages deployment guide
│   ├── PRD.md                  # Product requirements and specifications
│   └── SECURITY.md             # Security policies and reporting
│
├── functions/                  # ☁️ Cloudflare Pages Functions
│   ├── api/
│   │   └── [[path]].ts         # API proxy for HuggingFace (CORS handling)
│   └── debug.ts                # Debug utilities
│
├── public/                     # 🎨 Static Assets
│   ├── favicon.svg
│   ├── apple-touch-icon.svg
│   ├── mask-icon.svg
│   ├── pwa-192x192.svg         # PWA icons
│   └── pwa-512x512.svg
│
├── scripts/                    # 🛠️ Build Scripts
│   └── generate-social-images.ts  # OG image generation
│
├── src/                        # 💻 Application Source
│   ├── components/
│   │   ├── common/             # Shared reusable components
│   │   │   ├── FeaturedModal.tsx
│   │   │   ├── ReadmeViewer.tsx
│   │   │   └── TokenSettings.tsx
│   │   │
│   │   ├── features/           # Feature-specific components
│   │   │   ├── achievements/   # 🏆 Gamification system
│   │   │   ├── comparison/     # ⚖️ Model comparison tool
│   │   │   ├── datasets/       # 🗂️ Dataset browser
│   │   │   ├── favorites/      # ⭐ Favorites management
│   │   │   ├── learning/       # 📚 Learning resources hub
│   │   │   ├── models/         # 🤖 Model explorer
│   │   │   ├── playground/     # 🧪 API playground
│   │   │   └── trending/       # 📊 Trending content
│   │   │
│   │   ├── layout/             # Layout and navigation
│   │   │   ├── Navigation.tsx
│   │   │   ├── PageBreadcrumb.tsx
│   │   │   ├── QuickNav.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-toggle.tsx
│   │   │
│   │   └── ui/                 # 🎨 Base UI components (shadcn/ui)
│   │       └── ...             # Buttons, dialogs, cards, etc.
│   │
│   ├── hooks/                  # 🎣 Custom React Hooks
│   │   ├── use-achievements.ts    # Achievement tracking
│   │   ├── use-api-error.ts       # API error handling
│   │   ├── use-copy-to-clipboard.ts
│   │   ├── use-favorites.ts       # Favorites state management
│   │   ├── use-local-storage.ts   # Persistent storage
│   │   ├── use-mobile.ts          # Responsive utilities
│   │   ├── use-navigation-history.ts
│   │   └── use-queries.ts         # TanStack Query wrappers
│   │
│   ├── lib/                    # 🔧 Utilities
│   │   └── utils.ts            # Helper functions (cn, etc.)
│   │
│   ├── services/               # 🌐 API Layer
│   │   └── huggingface.ts      # HuggingFace API client
│   │
│   ├── styles/                 # 🎨 Global Styles
│   │   └── theme.css           # CSS custom properties
│   │
│   ├── test/                   # 🧪 Test Setup
│   │   └── setup.ts            # Vitest configuration
│   │
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Application entry point
│   ├── index.css               # Global base styles
│   └── vite-env.d.ts           # Vite type definitions
│
├── tests/                      # 🧪 End-to-End Tests
│   └── e2e/
│       ├── achievements.spec.ts   # Achievement flow tests
│       └── playground.spec.ts     # Playground interaction tests
│
├── coverage/                   # 📊 Test Coverage Reports (generated)
│
├── components.json             # shadcn/ui configuration
├── eslint.config.js            # ESLint configuration
├── playwright.config.ts        # Playwright E2E test config
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── vitest.config.ts            # Vitest test configuration
└── wrangler.toml               # Cloudflare Pages configuration
```

### Architecture Overview

The application follows a clean, layered architecture:

```
┌─────────────────────────────────────────────────────────┐
│             React Application (UI Layer)                │
├─────────────────────────────────────────────────────────┤
│  Layout         Feature           Base UI               │
│  Components  ←→ Components    ←→  Components            │
│  (Navigation)   (Datasets)        (shadcn/ui)           │
├─────────────────────────────────────────────────────────┤
│              Custom React Hooks (Logic Layer)           │
│        use-favorites, use-queries, use-achievements     │
├─────────────────────────────────────────────────────────┤
│         TanStack Query (State Management Layer)         │
│          Caching • Background Sync • Mutations          │
├─────────────────────────────────────────────────────────┤
│           API Service Layer (Data Layer)                │
│              huggingface.ts - API Abstraction           │
├─────────────────────────────────────────────────────────┤
│        Cloudflare Pages Functions (Proxy Layer)         │
│              CORS Handling • Request Proxying           │
├─────────────────────────────────────────────────────────┤
│                 HuggingFace APIs                        │
│        huggingface.co/api • api-inference.hf.co         │
└─────────────────────────────────────────────────────────┘
```

**Key Design Patterns:**
- **Component Composition** — Small, reusable components built up into features
- **Custom Hooks** — Encapsulate reusable logic and state management
- **Service Layer** — Centralized API interactions with type safety
- **Code Splitting** — Lazy loading for optimal performance
- **Server State** — TanStack Query for caching and synchronization

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical documentation.

---

## 🛠️ Tech Stack

### Core Framework
- **[React 19](https://react.dev/)** — Latest React with improved performance and features
- **[TypeScript](https://www.typescriptlang.org/)** — Type-safe JavaScript for better DX
- **[Vite](https://vitejs.dev/)** — Next-generation frontend build tool with HMR

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** — Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** — Re-usable component library built on Radix UI
- **[Radix UI](https://www.radix-ui.com/)** — Unstyled, accessible component primitives
- **[Phosphor Icons](https://phosphoricons.com/)** — Flexible icon family
- **[Lucide Icons](https://lucide.dev/)** — Beautiful & consistent icons
- **[Framer Motion](https://www.framer.com/motion/)** — Production-ready animations

### State Management & Data Fetching
- **[TanStack Query](https://tanstack.com/query)** (React Query) — Powerful async state management
  - Server state synchronization
  - Automatic caching and background updates
  - Request deduplication
  - Optimistic updates

### Developer Experience
- **[ESLint](https://eslint.org/)** — Code linting with React and TypeScript rules
- **[Prettier](https://prettier.io/)** — Opinionated code formatting
- **[Vitest](https://vitest.dev/)** — Blazing fast unit testing
- **[Playwright](https://playwright.dev/)** — Reliable end-to-end testing
- **[@testing-library/react](https://testing-library.com/react)** — User-centric component testing

### Additional Libraries
- **[next-themes](https://github.com/pacocoursey/next-themes)** — Perfect dark mode in 2 lines
- **[React Hook Form](https://react-hook-form.com/)** — Performant form validation
- **[DOMPurify](https://github.com/cure53/DOMPurify)** — XSS sanitizer for markdown
- **[marked](https://marked.js.org/)** — Fast markdown parser
- **[Sonner](https://sonner.emilkowal.ski/)** — Opinionated toast component
- **[cmdk](https://cmdk.paco.me/)** — Fast command menu component
- **[Recharts](https://recharts.org/)** — Composable charting library
- **[Embla Carousel](https://www.embla-carousel.com/)** — Lightweight carousel
- **[Vaul](https://vaul.emilkowal.ski/)** — Drawer component for React

### Deployment & Infrastructure
- **[Cloudflare Pages](https://pages.cloudflare.com/)** — JAMstack deployment platform
  - Global CDN distribution
  - Automatic HTTPS
  - Serverless Functions for API proxy
  - Built-in preview deployments
- **[Cloudflare Pages Functions](https://developers.cloudflare.com/pages/platform/functions/)** — Edge computing for CORS proxy

### PWA & Performance
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** — Zero-config PWA for Vite
  - Service Worker generation
  - Offline support
  - Install prompts
  - Web app manifest
- **[rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer)** — Bundle size analysis

---

## 🚀 Deployment

The application is deployed to **Cloudflare Pages** with custom domain support.

### Automatic Deployment (GitHub Actions)

Every push to `main` automatically deploys to production:

```
https://hug.andernet.dev
```

Pull requests create preview deployments:

```
https://<branch-name>.hug.pages.dev
```

### Manual Deployment

Using Wrangler CLI:

```bash
# Install Wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npm run build
wrangler pages deploy dist --project-name=hug
```

### Environment Variables

#### Required for CI/CD (GitHub Secrets)

| Secret | Description | Where to Get |
|--------|-------------|--------------|
| `CLOUDFLARE_API_TOKEN` | API token for deployments | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) → Create Token → Cloudflare Pages (Edit) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Found in URL after `/accounts/` in Cloudflare Dashboard |

#### Optional (Cloudflare Pages Environment Variables)

| Variable | Description | Type |
|----------|-------------|------|
| `VITE_HF_TOKEN` | Default HuggingFace API token | Secret (encrypted) |

> **Note:** Users can set their own API token in the app settings. The environment variable is a fallback.

### Cloudflare Pages Configuration

The app uses Cloudflare Pages Functions (`functions/api/[[path]].ts`) to proxy HuggingFace API requests:

**Proxy Routes:**
- `/api/*` → `https://huggingface.co/api/*`
- `/api/inference/*` → `https://api-inference.huggingface.co/models/*`

This solves CORS issues and keeps API tokens secure.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for complete deployment instructions.

---

## 🎨 Theming

The app supports **light**, **dark**, and **system** themes with seamless switching.

### Changing Themes

Click the sun/moon icon in the navigation bar to cycle through:
- ☀️ Light mode
- 🌙 Dark mode
- 💻 System preference

### Theme Persistence

Theme selection is automatically saved to `localStorage` and persists across sessions.

### Custom Themes

Themes are defined using CSS custom properties in [src/styles/theme.css](src/styles/theme.css). You can customize:
- Color palette
- Border radius
- Shadows
- Typography scale

---

## 📱 Progressive Web App (PWA)

The application can be installed as a standalone PWA on desktop and mobile devices.

### Features

✅ **Offline Support** — Cached assets and API responses work without internet  
✅ **Installable** — Add to home screen on mobile, install on desktop  
✅ **Auto-Update** — Service Worker updates automatically in background  
✅ **Native-Like** — Full-screen mode without browser chrome  
✅ **Fast Loading** — Aggressive caching for instant page loads

### Installing the PWA

**Desktop (Chrome/Edge):**
1. Click the install icon (➕) in the address bar
2. Or go to Settings → Install HuggingFace Playground

**Mobile (iOS):**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**Mobile (Android):**
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Install app" or "Add to Home screen"

### Service Worker

The service worker provides:
- **Precaching** — Critical assets cached on install
- **Runtime Caching** — API responses cached as you browse
- **Offline Fallback** — Graceful offline experience
- **Background Sync** — Updates fetch in background

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/andernet/huggingface.git
   cd huggingface
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```

### Branch Naming Convention

Use these prefixes for branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/dataset-export` |
| `fix/` | Bug fixes | `fix/api-error-handling` |
| `refactor/` | Code refactoring | `refactor/api-service` |
| `perf/` | Performance improvements | `perf/lazy-loading` |
| `a11y/` | Accessibility improvements | `a11y/keyboard-nav` |
| `ux/` | UX improvements | `ux/loading-states` |
| `dx/` | Developer experience | `dx/better-types` |
| `docs/` | Documentation updates | `docs/api-guide` |
| `test/` | Test additions/fixes | `test/playground-e2e` |

### Development Guidelines

**Code Quality:**
- Follow existing code style and patterns
- Write TypeScript with proper types (avoid `any`)
- Use meaningful variable and function names
- Keep functions small and focused

**Testing:**
- Write unit tests for utilities and services
- Add E2E tests for critical user flows
- Ensure all tests pass before submitting PR
- Maintain or improve code coverage

**Documentation:**
- Update README if adding features
- Add JSDoc comments for complex functions
- Update relevant docs in `docs/` folder

### Before Submitting

Run these checks locally:

```bash
# Lint your code
npm run lint

# Type check
npm run type-check

# Run tests
npm run test

# Check formatting
npm run format:check
```

Fix any issues that arise:

```bash
npm run lint:fix
npm run format
```

### Submitting a Pull Request

1. **Commit your changes** with descriptive messages:
   ```bash
   git add .
   git commit -m "feat: add dataset export functionality"
   ```

2. **Push to your fork:**
   ```bash
   git push origin feat/your-feature-name
   ```

3. **Open a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues
   - Describe your changes in detail
   - Include screenshots for UI changes
   - List any breaking changes

4. **Respond to feedback:**
   - Address review comments promptly
   - Push updates to the same branch
   - Mark conversations as resolved

### Code Review Process

- PRs require at least one approval
- Automated checks must pass (lint, type-check, tests)
- Maintainers may request changes
- Once approved, maintainers will merge

### Areas for Contribution

Looking for ideas? Consider:

- 🐛 **Bug Fixes** — Check open issues labeled `bug`
- ✨ **Features** — Issues labeled `enhancement` or `feature-request`
- 📚 **Documentation** — Improve guides, add examples
- ♿ **Accessibility** — Improve keyboard nav, screen reader support
- 🧪 **Tests** — Increase coverage, add E2E tests
- 🎨 **UI/UX** — Polish existing features, improve mobile experience
- ⚡ **Performance** — Optimize bundle size, improve load times

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete contribution guidelines.

---

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory:

| Document | Description |
|----------|-------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | Complete guide for contributors — branch naming, workflow, code standards |
| [Architecture](docs/ARCHITECTURE.md) | Technical architecture, design patterns, component organization |
| [Deployment Guide](docs/DEPLOYMENT.md) | Cloudflare Pages setup, CI/CD, environment variables, custom domains |
| [Product Requirements](docs/PRD.md) | Feature specifications, user flows, success criteria |
| [Security Policy](docs/SECURITY.md) | Reporting vulnerabilities, security best practices |

### Quick Links

- **API Documentation** — [HuggingFace API Docs](https://huggingface.co/docs/api-inference)
- **Component Library** — [shadcn/ui Docs](https://ui.shadcn.com/)
- **State Management** — [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- **Testing** — [Vitest Docs](https://vitest.dev/) • [Playwright Docs](https://playwright.dev/)

---

## 🔒 Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security details to the maintainers
3. Include steps to reproduce
4. Allow time for a fix before public disclosure

See [SECURITY.md](docs/SECURITY.md) for our complete security policy.

### Security Best Practices

- API tokens are stored in browser `localStorage` (never committed to git)
- Server-side tokens use Cloudflare environment variables (encrypted)
- User input is sanitized using DOMPurify before rendering
- API requests go through Cloudflare proxy (CORS protection)
- Regular dependency updates via Renovate bot

---

## 🗺️ Roadmap

Planned features and improvements:

- [ ] **Real-time Collaboration** — Share playground sessions with others
- [ ] **Code Export** — Export playground code as Python/JS snippets
- [ ] **History** — Track and replay previous API experiments
- [ ] **Compare Results** — Side-by-side comparison of different model outputs
- [ ] **Advanced Filtering** — More granular dataset/model search
- [ ] **Custom Collections** — Create and share curated model/dataset lists
- [ ] **API Rate Limiting UI** — Visual indicator for API quota usage
- [ ] **Notebook Integration** — Export to Jupyter/Colab notebooks

Have an idea? [Open an issue](https://github.com/andernet/huggingface/issues/new) or submit a PR!

---

## 🙏 Acknowledgments

This project builds on amazing open-source work:

- **[HuggingFace](https://huggingface.co/)** — For the incredible ML platform and APIs
- **[shadcn](https://twitter.com/shadcn)** — For the beautiful component library
- **[Vercel](https://vercel.com/)** — Inspiration from their developer experience
- **[Cloudflare](https://cloudflare.com/)** — For Pages and Functions platform
- **Open Source Community** — All the library authors and contributors

Special thanks to all [contributors](https://github.com/andernet/huggingface/graphs/contributors) who help improve this project!

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Matthew Anderson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support

Need help or have questions?

- 📖 **Documentation** — Check the [docs/](docs/) folder
- 💬 **Discussions** — Join [GitHub Discussions](https://github.com/andernet/huggingface/discussions)
- 🐛 **Bug Reports** — [Open an issue](https://github.com/andernet/huggingface/issues/new)
- ✨ **Feature Requests** — [Suggest a feature](https://github.com/andernet/huggingface/issues/new)

---

## ⭐ Show Your Support

If you find this project helpful, please consider:

- ⭐ **Star this repository** on GitHub
- 🐦 **Share it** with your network
- 🤝 **Contribute** improvements or features
- 📝 **Report bugs** or suggest enhancements

---

<div align="center">

**Built with ❤️ using React, TypeScript, and HuggingFace APIs**

[🚀 Live Demo](https://hug.andernet.dev) • [📖 Documentation](docs/) • [🤝 Contributing](CONTRIBUTING.md)

</div>
