# ShelfLife — Backend

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

The server runs at **http://localhost:5001**.

On first start the `ingredient_lookup` table is populated with 525 seed ingredients from `app/seed_data/shelf_life_complete_seed_data.json`.

## API Endpoints

### Health

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Returns `{"status": "ok"}` |

### Kitchens

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/kitchens` | Create a new kitchen |
| GET | `/api/kitchens/<key>` | Verify / fetch kitchen info |
| PUT | `/api/kitchens/<key>` | Update kitchen name |

### Lookup (ingredient reference data)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lookup/search?q=<query>` | Search ingredients (case-insensitive, max 10 results) |
| GET | `/api/lookup/<ingredient_name>` | Get full details for one ingredient |
| POST | `/api/lookup` | Add a user-created ingredient (or bump usage count if it exists) |

### Ingredients (in-stock inventory)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/kitchen/<key>/ingredients` | List all in-stock, grouped by category and shelf |
| GET | `/api/kitchen/<key>/ingredients/expiring-soon` | List items expiring soon |
| POST | `/api/kitchen/<key>/ingredients` | Bulk add items (array or single object) |
| PUT | `/api/kitchen/<key>/ingredients/<id>` | Update an item (recalculates expiration on storage change) |
| DELETE | `/api/kitchen/<key>/ingredients/<id>` | Remove an item |
| PATCH | `/api/kitchen/<key>/ingredients/<id>/toss` | Record waste amount then remove |

### Recipes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/kitchen/<key>/recipes/suggest` | Generate a recipe suggestion via Gemini AI |

## Database

SQLite file is created at `instance/fridge_door.db`. Four tables:

- **ingredient_lookup** — 525 seed ingredients + user-added items
- **in_stock** — items currently in the user's kitchen
- **kitchens** — kitchen identity and metadata
- **waste_tracker** — eaten/tossed counts per kitchen
