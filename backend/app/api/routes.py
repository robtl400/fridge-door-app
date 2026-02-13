from flask import Blueprint, jsonify, request
from app import db
from app.models.ingredient_lookup import IngredientLookup

api_bp = Blueprint("api", __name__)


@api_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200


# ---------------------------------------------------------------------------
# Lookup search  –  GET /api/lookup/search?q=<query>
# ---------------------------------------------------------------------------
@api_bp.route("/lookup/search", methods=["GET"])
def search_lookup():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify([]), 200

    pattern = f"%{query}%"
    lower_query = query.lower()

    # Search ingredient_name and keywords (case-insensitive)
    results = (
        IngredientLookup.query
        .filter(
            db.or_(
                IngredientLookup.ingredient_name.ilike(pattern),
                IngredientLookup.keywords.ilike(pattern),
            )
        )
        .all()
    )

    # Sort: exact name match first, then by times_added_by_user desc, then alpha
    def sort_key(item):
        is_exact = 0 if item.ingredient_name.lower() == lower_query else 1
        return (is_exact, -(item.times_added_by_user or 0), item.ingredient_name.lower())

    results.sort(key=sort_key)

    return jsonify([r.to_search_result() for r in results[:10]]), 200


# ---------------------------------------------------------------------------
# Get single ingredient  –  GET /api/lookup/<ingredient_name>
# ---------------------------------------------------------------------------
@api_bp.route("/lookup/<ingredient_name>", methods=["GET"])
def get_lookup(ingredient_name):
    ingredient = IngredientLookup.query.filter(
        IngredientLookup.ingredient_name.ilike(ingredient_name)
    ).first()

    if ingredient is None:
        return jsonify({"error": "Ingredient not found"}), 404

    return jsonify(ingredient.to_dict()), 200


# ---------------------------------------------------------------------------
# Add user ingredient  –  POST /api/lookup
# ---------------------------------------------------------------------------
@api_bp.route("/lookup", methods=["POST"])
def create_lookup():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    name = data.get("ingredient_name", "").strip()
    if not name:
        return jsonify({"error": "ingredient_name is required"}), 400

    # Check if it already exists
    existing = IngredientLookup.query.filter(
        IngredientLookup.ingredient_name.ilike(name)
    ).first()

    if existing:
        # Bump usage count instead of creating a duplicate
        existing.times_added_by_user = (existing.times_added_by_user or 0) + 1
        db.session.commit()
        return jsonify(existing.to_dict()), 200

    ingredient = IngredientLookup(
        ingredient_name=name,
        category=data.get("category", ""),
        subcategory=data.get("subcategory", ""),
        default_expiration_days=data.get("default_expiration_days", 7),
        default_temperature_category=data.get("default_temperature_category", "refrigerated"),
        default_shelf_name=data.get("default_shelf_name", "produce"),
        refrigerated_min_days=data.get("refrigerated_min_days"),
        refrigerated_max_days=data.get("refrigerated_max_days"),
        frozen_min_days=data.get("frozen_min_days"),
        frozen_max_days=data.get("frozen_max_days"),
        pantry_unopened_min_days=data.get("pantry_unopened_min_days"),
        pantry_unopened_max_days=data.get("pantry_unopened_max_days"),
        pantry_opened_min_days=data.get("pantry_opened_min_days"),
        pantry_opened_max_days=data.get("pantry_opened_max_days"),
        keywords=data.get("keywords", name),
        is_seed_data=False,
        times_added_by_user=1,
    )

    db.session.add(ingredient)
    db.session.commit()
    return jsonify(ingredient.to_dict()), 201
