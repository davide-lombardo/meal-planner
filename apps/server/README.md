# Meal Planner Server

This is the Node/Express backend for the Meal Planner app, managed in an Nx monorepo.

## Usage

### Start the development server
```bash
nx serve server
```
- The server will run on the port specified in your `.env` file or default to 3001.

### Build for production
```bash
nx build server
```
- Output will be in `dist/apps/server`.

### Lint the code
```bash
nx lint server
```

### Run tests
```bash
nx test server
```

## Project Structure
- `index.ts` - Main entry point
- `utils/` - Utility modules
- `data/` - JSON data files (recipes, history, config)

## Environment Variables
- See the root `.env` file for email and server configuration.

---
For more Nx commands and advanced options, see the root `README.md` or [Nx documentation](https://nx.dev).
