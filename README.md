# ShelfLife

A full-stack app for tracking what's in your fridge, freezer, and pantry — with shelf-life awareness powered by USDA data.

## Project Structure

```
fridge-door-app/
├── backend/            Flask API + SQLite database
│   ├── app/
│   │   ├── models/     SQLAlchemy models (ingredient_lookup, in_stock)
│   │   ├── routes/     API route handlers (health, lookup, ingredients)
│   │   ├── utils/      Business logic (expiration parsing, shelf ordering)
│   │   └── seed_data/  525 USDA + manual ingredient entries
│   ├── app.py          Entry point
│   └── config.py       Configuration
└── frontend/           React + Vite
    └── src/
        ├── components/
        ├── pages/
        ├── services/
        └── utils/
```

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

Runs at **http://localhost:5001**. Creates the database and seeds 525 ingredients on first start.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at **http://localhost:3000**. API requests to `/api` are proxied to the backend.

## Tech Stack

**Backend:** Flask, SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-Login, Marshmallow, Flask-CORS

**Frontend:** React, Vite, React Router, MUI, ReactFlow, @neodrag/react
