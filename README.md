# Weekly Menu Planner

A Node.js application that generates weekly menus based on predefined recipes, maintains history to avoid repetition, and sends the menu via email with a shopping list.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Setup

1. Clone the repository:
```bash
git clone [your-repository-url]
cd weekly-menu-planner
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-password
EMAIL_TO=recipient@example.com
EMAIL_SERVICE=gmail
```

4. Set up the data files in the `data` directory:

`config.json`:
```json
{
  "menuOptions": {
    "maxRepetitionWeeks": 4
  }
}
```

`recipes.json`:
```json
[
  {
    "id": "recipe1",
    "nome": "Pasta alla carbonara",
    "categoria": "pasta",
    "tipo": "pranzo",
    "ingredienti": [
      "pasta",
      "uova",
      "pecorino",
      "guanciale"
    ]
  }
]
```

`history.json`: Leave empty

## Usage

Run the application:
```bash
node main.js
```

The application will:
1. Generate a weekly menu based on your recipes
2. Create a shopping list
3. Send an email with the menu and shopping list
4. Save the menu to history to avoid repetition

## Clear History

To clear the menu history, simply empty the contents of `history.json`

## Project Structure

```
weekly-menu-planner/
├── data/
│   ├── config.json
│   ├── recipes.json
│   └── history.json
├── utils/
│   ├── menuGenerator.js
│   └── email.js
├── main.js
├── .env
└── README.md
```