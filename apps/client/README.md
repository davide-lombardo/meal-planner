# Meal Planner Client

This is the React frontend for the Meal Planner app, managed in an Nx monorepo.

## Usage

### Start the development server
```bash
nx serve client
```
- The app will be available at http://localhost:4200 (or the port shown in the terminal).

### Build for production
```bash
nx build client
```
- Output will be in `dist/apps/client`.

### Lint the code
```bash
nx lint client
```

### Run tests
```bash
nx test client
```

## Project Structure
- `src/` - Main source code (components, pages, utils, etc.)
- `public/` - Static assets
- `test/` - Unit and integration tests

## Environment Variables
- See the root `.env` file for configuration shared with the backend.

---
For more Nx commands and advanced options, see the root `README.md` or [Nx documentation](https://nx.dev).
