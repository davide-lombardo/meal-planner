# Meal Planner

- **Email Notifications**: Send meal plans and shopping lists via email
- **Seasonal Filtering**: Filter recipes by season for seasonal cooking
- **Dark Mode**: Toggle between light and dark themes

## Tech Stack
- **Backend**: Express.js with TypeScript
- **Database**: SQLite (all data stored in `data.db`, no JSON files)
- **Validation**: Zod schema validation
- **Email**: Nodemailer for sending emails
- **Package Management**: PNPM workspace monorepo

## Project Structure

- `apps/client`: React frontend application
- `apps/server`: Express.js backend API (uses SQLite for all data)
- `libs/shared`: Shared schemas and utilities

## Getting Started

### Prerequisites

- Node.js (v18+)
- PNPM (v7+)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/meal-planner.git
cd meal-planner

# Install dependencies
pnpm install

# All data is stored in SQLite (data.db). No JSON files required.

# Start development servers
pnpm dev
```

## Development

```bash
# Run only the frontend
pnpm dev:client

# Run only the backend
pnpm dev:server

# Run tests
pnpm test:all
```

## Recent Improvements

- Added comprehensive state management with React Context
- Implemented data caching for improved performance
- Added dark mode theme support
- Created custom hooks for data fetching and management
- Enhanced error handling on the server
- Improved ingredient parsing
- Added notifications system
