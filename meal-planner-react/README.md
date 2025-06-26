# Meal Planner React App

A modern meal planner web application built with React, TypeScript, Vite, and MUI Joy, featuring recipe management and meal plan email functionality.

## Features
- Add, edit, and view recipes
- Beautiful UI with custom color palette (60/30/10 rule)
- Send your meal plan to your email
- Backend email sending with Node.js, Express, and Nodemailer

## Project Structure
```
meal-planner-react/
├── public/                # Static assets (optional)
├── src/                   # React frontend source code
│   ├── data/              # recipes.json, config.json, history.json
│   ├── pages/             # Home.tsx, etc.
│   ├── utils/             # sendMealPlanEmail.ts, etc.
│   └── ThemeProvider.tsx  # MUI Joy theme
├── server/                # Backend email server (TypeScript)
│   ├── index.ts           # Express server
│   ├── email.ts           # Email sending logic
│   ├── package.json       # Backend dependencies/scripts
│   └── tsconfig.json      # Backend TypeScript config
├── .env                   # Environment variables (see below)
├── package.json           # Frontend dependencies/scripts
└── README.md              # This file
```

## Prerequisites
- Node.js v18 or newer
- npm

## Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd meal-planner-react
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
cd server
npm install
cd ..
```

### 4. Configure environment variables
Create a `.env` file in the `meal-planner-react` folder:
```
SMTP_USER=your_gmail_address@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
NOTIFICATION_EMAIL=recipient_email@gmail.com
```
- For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) if you have 2FA enabled.

### 5. Start the backend server
```bash
cd server
npm run build   # Compile TypeScript
npm start       # Start the server
```
The backend will run on http://localhost:4000

### 6. Start the frontend (React) app
In a new terminal:
```bash
npm run dev
```
The frontend will run on http://localhost:5173

## Usage
- Open http://localhost:5173 in your browser.
- Add, edit, and view recipes.
- Click "Send Meal Plan to Email" to email your meal plan.

## Customization
- Edit `src/data/recipes.json` to pre-populate recipes.
- Change the color palette in `src/ThemeProvider.tsx`.

## Troubleshooting
- If email sending fails, check your `.env` values and backend server logs.
- Make sure both frontend and backend servers are running.

## License
MIT

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
