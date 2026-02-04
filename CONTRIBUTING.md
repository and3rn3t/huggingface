# Contributing to HuggingFace Playground

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/andernet/huggingface.git
   cd huggingface
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

## 📁 Branch Naming Convention

Use the following prefixes for branch names:

| Prefix | Purpose |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `refactor/` | Code refactoring |
| `perf/` | Performance improvements |
| `a11y/` | Accessibility improvements |
| `ux/` | UX improvements |
| `dx/` | Developer experience |
| `docs/` | Documentation |

## 💻 Development Workflow

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Make your changes

3. Run checks before committing:
   ```bash
   npm run lint        # Check for linting errors
   npm run type-check  # Check TypeScript types
   npm run format      # Format code with Prettier
   ```

4. Build to ensure no build errors:
   ```bash
   npm run build
   ```

## 📝 Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `a11y`: Accessibility improvement
- `ux`: UX improvement
- `dx`: Developer experience
- `docs`: Documentation
- `style`: Code style (formatting, semicolons, etc.)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(playground): add code examples for Python and JavaScript

fix(api): handle rate limiting errors gracefully

refactor(components): extract TaskCard from ApiPlayground

docs: update README with PWA instructions
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui style)
│   └── playground/     # API Playground subcomponents
├── hooks/              # Custom React hooks
│   ├── use-favorites.ts
│   ├── use-queries.ts    # React Query hooks
│   └── use-api-error.ts
├── services/           # API service layer
│   └── huggingface.ts  # HuggingFace API client
├── lib/                # Utility functions
└── styles/             # Global styles
```

## 🎨 Code Style

- Use TypeScript for all new files
- Use functional components with hooks
- Follow the existing patterns in the codebase
- Use Tailwind CSS for styling
- Use path aliases (`@/`) for imports

## 🧪 Testing Changes

Before submitting a PR:

1. Test in both light and dark themes
2. Test on mobile viewport sizes
3. Test keyboard navigation
4. Check console for errors/warnings

## 📦 Adding Dependencies

- Prefer smaller, focused packages
- Check bundle impact with `npm run build`
- View bundle analysis at `dist/stats.html`

## 🔄 Pull Request Process

1. Update documentation if needed
2. Ensure all checks pass
3. Request review from maintainers
4. Address feedback promptly
5. Squash commits if requested

## ❓ Questions?

Open an issue for any questions or suggestions!
