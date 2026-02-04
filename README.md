# 🤗 HuggingFace Playground

A modern, interactive playground for exploring HuggingFace's datasets, models, and Inference API.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Tests](https://img.shields.io/badge/tests-44%20passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-73%25-green)

## ✨ Features

- **Dataset Browser** - Search and explore HuggingFace datasets
- **Model Explorer** - Discover AI models with filtering and search
- **API Playground** - Test Inference API with real-time responses
- **Model Comparison** - Compare models side-by-side
- **Favorites** - Save and organize your favorite datasets/models
- **Learning Resources** - Curated guides and documentation
- **Achievements** - Track your exploration progress
- **PWA Support** - Install as a standalone app with offline caching

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Available Scripts

| Script                 | Description                    |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Start development server       |
| `npm run build`        | Build for production           |
| `npm run preview`      | Preview production build       |
| `npm run lint`         | Run ESLint                     |
| `npm run lint:fix`     | Fix ESLint errors              |
| `npm run format`       | Format code with Prettier      |
| `npm run format:check` | Check code formatting          |
| `npm run type-check`   | Run TypeScript type checking   |
| `npm run test`         | Run tests with Vitest          |
| `npm run test:ui`      | Run tests with UI              |
| `npm run coverage`     | Generate test coverage report  |
| `npm run generate-og`  | Generate social sharing images |
| `npm run clean`        | Clean dist and cache           |

## 🔑 API Configuration

To use the HuggingFace Inference API:

1. Get a token from [HuggingFace Settings](https://huggingface.co/settings/tokens)
2. Click the gear icon (⚙️) in the app navigation
3. Enter your API token

Tokens are stored securely in your browser's localStorage.

## 🏗️ Project Structure

```
├── docs/                  # Documentation files
│   ├── DEPLOYMENT.md      # Cloudflare deployment guide
│   ├── PRD.md             # Product requirements document
│   └── SECURITY.md        # Security policy
├── functions/             # Cloudflare Pages Functions
│   └── api/               # API proxy routes
├── public/                # Static assets (icons, PWA assets)
├── scripts/               # Build and utility scripts
├── src/
│   ├── components/
│   │   ├── common/        # Shared reusable components
│   │   ├── features/      # Feature-specific components
│   │   │   ├── achievements/
│   │   │   ├── comparison/
│   │   │   ├── datasets/
│   │   │   ├── favorites/
│   │   │   ├── learning/
│   │   │   ├── models/
│   │   │   ├── playground/
│   │   │   └── trending/
│   │   ├── layout/        # Navigation, theme, layout components
│   │   └── ui/            # Base UI components (shadcn/ui)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── services/          # API service layer
│   ├── styles/            # Global styles
│   └── test/              # Test setup and utilities
└── tests/                 # End-to-end tests
    └── e2e/               # Playwright E2E tests
```

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **State Management:** TanStack Query (React Query)
- **Icons:** Phosphor Icons
- **Animations:** Framer Motion
- **Theming:** next-themes
- **PWA:** vite-plugin-pwa

## 📦 Bundle Analysis

After building, view the bundle analysis at `dist/stats.html`:

```bash
npm run build
open dist/stats.html
```

## 🎨 Theming

The app supports light, dark, and system themes. Click the sun/moon icon in the navigation to switch themes. Theme preference is persisted to localStorage.

## 📱 PWA

The app can be installed as a Progressive Web App:

- **Offline Support:** Cached assets and API responses
- **Installable:** Add to home screen on mobile/desktop
- **Auto-Update:** Service worker updates automatically

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run lint && npm run type-check`
4. Submit a pull request

## 📚 Documentation

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to this project
- [Deployment Guide](docs/DEPLOYMENT.md) - Cloudflare Pages deployment setup
- [Product Requirements](docs/PRD.md) - Feature specifications and planning
- [Security Policy](docs/SECURITY.md) - Reporting security vulnerabilities
- [Architecture](docs/ARCHITECTURE.md) - Technical architecture overview

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.
