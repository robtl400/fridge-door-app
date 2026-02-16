from flask import Blueprint, jsonify, request
from datetime import date, timedelta, datetime, timezone
from collections import OrderedDict
from app import db
from app.models.kitchen import Kitchen
from app.models.ingredient_lookup import IngredientLookup
from app.models.in_stock import InStock
from app.utils.expiration import parse_expiration
from app.utils.shelves import get_shelf_sort_key, get_category_sort_key
from app.utils.ingredients import expiration_for_storage, get_or_create_lookup

ingredients_bp = Blueprint("ingredients", __name__)


def _get_kitchen_or_404(kitchen_key):
    """Look up kitchen by key, update last_accessed, or return None."""
    kitchen = Kitchen.query.filter_by(kitchen_key=kitchen_key).first()
    if not kitchen:
        return None
    kitchen.last_accessed = datetime.now(timezone.utc)
    db.session.commit()
    return kitchen


@ingredients_bp.route("/kitchen/<kitchen_key>/ingredients", methods=["GET"])
def list_ingredients(kitchen_key):
    kitchen = _get_kitchen_or_404(kitchen_key)
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    items = InStock.query.filter_by(kitchen_key=kitchen_key).all()
    if not items:
        return jsonify({}), 200

    # Group by category then shelf
    buckets = {}
    for item in items:
        cat = item.temperature_category
        shelf = item.shelf_name
        buckets.setdefault(cat, {}).setdefault(shelf, []).append(item)

    # Soonest-to-expire first within each shelf
    for cat in buckets:
        for shelf in buckets[cat]:
            buckets[cat][shelf].sort(key=lambda i: i.expiration_date)

    # Build ordered response: categories then shelves in canonical order
    sorted_cats = sorted(buckets.keys(), key=get_category_sort_key)
    result = OrderedDict()
    for cat in sorted_cats:
        sorted_shelves = sorted(buckets[cat].keys(), key=get_shelf_sort_key)
        shelf_dict = OrderedDict()
        for shelf in sorted_shelves:
            shelf_dict[shelf] = [i.to_dict() for i in buckets[cat][shelf]]
        result[cat] = shelf_dict

    return jsonify(result), 200


@ingredients_bp.route("/kitchen/<kitchen_key>/ingredients", methods=["POST"])
def add_ingredients(kitchen_key):
    kitchen = _get_kitchen_or_404(kitchen_key)
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    body = request.get_json()
    if not body:
        return jsonify({"error": "Request body required"}), 400

    items = body if isinstance(body, list) else [body]
    created = []

    for item in items:
        name = item.get("ingredient_name", "").strip()
        if not name:
            continue

        temp_category = item.get("temperature_category", "refrigerated")
        shelf_name = item.get("shelf_name")
        quantity = item.get("quantity", 1)
        notes = item.get("notes")

        lookup = get_or_create_lookup(
            name, temp_category,
            shelf_name or "produce",
            item.get("expiration_days", 7),
        )

        if not shelf_name:
            shelf_name = lookup.default_shelf_name

        # User-provided expiration takes priority over lookup calculation
        exp_input = item.get("expiration")
        if exp_input is not None:
            try:
                exp_date = parse_expiration(exp_input)
            except ValueError:
                return jsonify({"error": f"Bad expiration format: {exp_input!r}"}), 400
            exp_days = (exp_date - date.today()).days
        else:
            exp_days = expiration_for_storage(lookup, temp_category)
            exp_date = date.today() + timedelta(days=exp_days)

        record = InStock(
            ingredient_name=lookup.ingredient_name,
            quantity=quantity,
            temperature_category=temp_category,
            shelf_name=shelf_name,
            expiration_days=exp_days,
            expiration_date=exp_date,
            notes=notes,
            lookup_id=lookup.id,
            kitchen_key=kitchen_key,
        )
        db.session.add(record)
        created.append(record)

    db.session.commit()
    return jsonify([r.to_dict() for r in created]), 201


@ingredients_bp.route(
    "/kitchen/<kitchen_key>/ingredients/<int:item_id>", methods=["PUT"]
)
def update_ingredient(kitchen_key, item_id):
    kitchen = _get_kitchen_or_404(kitchen_key)
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    item = db.session.get(InStock, item_id)
    if item is None or item.kitchen_key != kitchen_key:
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    temp_changed = (
        "temperature_category" in data
        and data["temperature_category"] != item.temperature_category
    )

    for field in ("ingredient_name", "quantity", "shelf_name", "notes"):
        if field in data:
            setattr(item, field, data[field])

    if "temperature_category" in data:
        item.temperature_category = data["temperature_category"]

    # Explicit expiration always wins; otherwise recalculate on storage change
    if "expiration" in data:
        try:
            exp_date = parse_expiration(data["expiration"])
        except ValueError:
            return jsonify({"error": f"Bad expiration format: {data['expiration']!r}"}), 400
        item.expiration_date = exp_date
        item.expiration_days = (exp_date - date.today()).days
    elif temp_changed and item.lookup_id:
        lookup = db.session.get(IngredientLookup, item.lookup_id)
        if lookup:
            exp_days = expiration_for_storage(lookup, item.temperature_category)
            item.expiration_days = exp_days
            item.expiration_date = date.today() + timedelta(days=exp_days)

    db.session.commit()
    return jsonify(item.to_dict()), 200


@ingredients_bp.route(
    "/kitchen/<kitchen_key>/ingredients/<int:item_id>", methods=["DELETE"]
)
def delete_ingredient(kitchen_key, item_id):
    kitchen = _get_kitchen_or_404(kitchen_key)
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    item = db.session.get(InStock, item_id)
    if item is None or item.kitchen_key != kitchen_key:
        return jsonify({"error": "Item not found"}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify({"deleted": item_id}), 200


@ingredients_bp.route(
    "/kitchen/<kitchen_key>/ingredients/<int:item_id>/toss", methods=["PATCH"]
)
def toss_ingredient(kitchen_key, item_id):
    kitchen = _get_kitchen_or_404(kitchen_key)
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    item = db.session.get(InStock, item_id)
    if item is None or item.kitchen_key != kitchen_key:
        return jsonify({"error": "Item not found"}), 404

    data = request.get_json() or {}
    amount = data.get("amount", "all")
    if amount not in ("a_bit", "most", "all"):
        return jsonify({"error": "amount must be a_bit, most, or all"}), 400

    toss_record = {
        "ingredient_name": item.ingredient_name,
        "temperature_category": item.temperature_category,
        "shelf_name": item.shelf_name,
        "days_until_expiration": item.days_until_expiration,
        "amount_tossed": amount,
        "tossed_item_id": item.id,
    }

    db.session.delete(item)
    db.session.commit()
    return jsonify(toss_record), 200
