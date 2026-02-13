# Fridge Door — Backend

Flask API server with SQLite database.

## Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template and edit as needed
cp .env.example .env

# Run the server (creates DB and seeds data on first start)
python app.py
```

The server runs at **http://localhost:5000**.

On first start the `ingredient_lookup` table is populated with 525 seed ingredients from `app/seeds/shelf_life_complete_seed_data.json`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check — returns `{"status": "ok"}` |
| GET | `/api/lookup/search?q=<query>` | Search ingredients (case-insensitive, max 10 results) |
| GET | `/api/lookup/<ingredient_name>` | Get full details for one ingredient |
| POST | `/api/lookup` | Add a user-created ingredient (or bump usage count if it exists) |

### POST /api/lookup body

```json
{
  "ingredient_name": "Kimchi",
  "default_expiration_days": 30,
  "default_temperature_category": "refrigerated",
  "default_shelf_name": "condiments_sauces"
}
```

## Database

SQLite file is created at `instance/fridge_door.db` (relative to the backend directory). Two tables:

- **ingredient_lookup** — 525 seed ingredients + user-added items
- **in_stock** — items currently in the user's fridge/pantry
