from flask import Blueprint, jsonify, request
from datetime import datetime, timezone
from app import db
from app.models.kitchen import Kitchen
from app.utils.kitchen_keys import generate_kitchen_key

kitchen_bp = Blueprint("kitchens", __name__)


@kitchen_bp.route("/kitchens", methods=["POST"])
def create_kitchen():
    """Create a new kitchen with a unique key. No auth required."""
    # Generate a unique key (retry on the rare collision)
    for _ in range(10):
        key = generate_kitchen_key()
        if not Kitchen.query.filter_by(kitchen_key=key).first():
            break
    else:
        return jsonify({"error": "Could not generate unique key"}), 500

    data = request.get_json() or {}
    kitchen = Kitchen(
        kitchen_key=key,
        name=data.get("name"),
    )
    db.session.add(kitchen)
    db.session.commit()

    return jsonify(kitchen.to_dict()), 201


@kitchen_bp.route("/kitchens/<kitchen_key>", methods=["GET"])
def verify_kitchen(kitchen_key):
    """Verify a kitchen key exists and return its info."""
    kitchen = Kitchen.query.filter_by(kitchen_key=kitchen_key).first()
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    kitchen.last_accessed = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(kitchen.to_dict()), 200


@kitchen_bp.route("/kitchens/<kitchen_key>", methods=["PUT"])
def update_kitchen(kitchen_key):
    """Update kitchen metadata (e.g. friendly name)."""
    kitchen = Kitchen.query.filter_by(kitchen_key=kitchen_key).first()
    if not kitchen:
        return jsonify({"error": "Kitchen not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    if "name" in data:
        kitchen.name = data["name"]

    kitchen.last_accessed = datetime.now(timezone.utc)
    db.session.commit()

    return jsonify(kitchen.to_dict()), 200
