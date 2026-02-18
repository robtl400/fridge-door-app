from flask import Blueprint, jsonify, request
from datetime import datetime, timezone
from app import db
from app.models.kitchen import Kitchen
from app.models.in_stock import InStock
from app.utils.gemini import generate_recipe

recipe_bp = Blueprint("recipes", __name__)


def _get_kitchen_or_404(kitchen_key):
    """Look up kitchen by key, update last_accessed, or return None."""
    kitchen = Kitchen.query.filter_by(kitchen_key=kitchen_key).first()
    if not kitchen:
        return None
    kitchen.last_accessed = datetime.now(timezone.utc)
    db.session.commit()
    return kitchen


@recipe_bp.route("/kitchen/<kitchen_key>/recipes/suggest", methods=["POST"])
def suggest_recipe(kitchen_key):
    kitchen = _get_kitchen_or_404(kitchen_key)
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400

    ingredients = body.get("ingredients", [])
    if not ingredients:
        return jsonify({"error": "At least one ingredient is required"}), 400

    dietary_restrictions = body.get("dietary_restrictions", [])

    # Fetch full inventory for in_stock matching
    all_items = InStock.query.filter_by(kitchen_key=kitchen_key).all()
    inventory_names = list({item.ingredient_name for item in all_items})

    try:
        recipe = generate_recipe(
            ingredients=ingredients,
            dietary_restrictions=dietary_restrictions if dietary_restrictions else None,
            inventory_names=inventory_names,
        )
        return jsonify(recipe), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 503
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e).lower()
        if "429" in error_msg or "rate" in error_msg or "quota" in error_msg:
            return jsonify({
                "error": "Recipe generation rate limit reached. Please wait a moment and try again.",
                "retry_after": 60,
            }), 429
        return jsonify({
            "error": "Failed to generate recipe. Please try again.",
            "detail": str(e),
        }), 502
