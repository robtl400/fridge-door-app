import json
import os
from app import db
from app.models.ingredient_lookup import IngredientLookup


def seed_ingredient_lookup():
    """Populate ingredient_lookup table from seed JSON if empty."""
    if IngredientLookup.query.first() is not None:
        return  # Already seeded

    seed_path = os.path.join(os.path.dirname(__file__), "shelf_life_complete_seed_data.json")
    with open(seed_path, "r") as f:
        data = json.load(f)

    ingredients = data.get("ingredients", [])
    seen_names = set()
    added = 0

    for ing in ingredients:
        name = ing["ingredient_name"]
        if name.lower() in seen_names:
            continue
        seen_names.add(name.lower())

        storage = ing.get("storage_methods", {})
        refrigerated = storage.get("refrigerated", {})
        frozen = storage.get("frozen", {})
        pantry_unopened = storage.get("pantry_unopened", {})
        pantry_opened = storage.get("pantry_opened", {})

        record = IngredientLookup(
            ingredient_name=name,
            category=ing.get("category", ""),
            subcategory=ing.get("subcategory", ""),
            default_expiration_days=ing["default_expiration_days"],
            default_temperature_category=ing["default_temperature_category"],
            default_shelf_name=ing["default_shelf_name"],
            refrigerated_min_days=refrigerated.get("min_days"),
            refrigerated_max_days=refrigerated.get("max_days"),
            frozen_min_days=frozen.get("min_days"),
            frozen_max_days=frozen.get("max_days"),
            pantry_unopened_min_days=pantry_unopened.get("min_days"),
            pantry_unopened_max_days=pantry_unopened.get("max_days"),
            pantry_opened_min_days=pantry_opened.get("min_days"),
            pantry_opened_max_days=pantry_opened.get("max_days"),
            keywords=ing.get("keywords", ""),
            is_seed_data=True,
            times_added_by_user=0,
        )
        db.session.add(record)
        added += 1

    db.session.commit()
    print(f"Seeded {added} ingredients into ingredient_lookup (skipped {len(ingredients) - added} duplicates).")
