# Meal Planner Monorepo (Nx + pnpm)

A modern meal planner web application built with React (frontend) and Node/Express (backend), managed as a monorepo using Nx and pnpm.

## Features
- Add, edit, and view recipes
- Beautiful, responsive UI (MUI Joy, dark mode)
- Send your meal plan to your email
- Backend email sending with Node.js, Express, and Nodemailer
- Nx-powered monorepo for scalable development

## Project Structure
```
apps/
  client/    # React frontend (src, public, test, etc.)
  server/    # Node/Express backend (index.ts, utils, etc.)
libs/        # Shared libraries (optional)
.env         # Environment variables (see below)
.prettierrc  # Prettier config
.prettierignore
.gitignore
pnpm-workspace.yaml
package.json # Monorepo root
README.md
```

## Prerequisites
- Node.js v18 or newer
- pnpm (install with `npm install -g pnpm`)

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd meal-planner
```

### 2. Install dependencies
```bash
pnpm install
```

## App Usage

### Start the frontend (React)
```bash
nx serve client
```
- Open http://localhost:4200 in your browser.

### Start the backend (Node/Express)
```bash
nx serve server
```
- The API will run on the port specified in your `.env` (default: 3001).

### Build, Lint, and Test
- Build: `nx build <client|server>`
- Lint: `nx lint <client|server>`
- Test: `nx test <client|server>`

## Environment Variables
- Copy `.env.example` to `.env` and fill in required values for email, etc.
- Both frontend and backend use the same `.env` at the root.

## Nx Workspace
- Use Nx Console or CLI for advanced monorepo management.
- See [Nx documentation](https://nx.dev) for more info.

---
MIT License

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
