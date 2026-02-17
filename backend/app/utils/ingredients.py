from app import db
from app.models.ingredient_lookup import IngredientLookup

# Maps user-facing storage choice to the lookup table's min/max field pairs
_STORAGE_FIELDS = {
    "Fridge": ("refrigerated_min_days", "refrigerated_max_days"),
    "Freezer": ("frozen_min_days", "frozen_max_days"),
    "Pantry": [
        ("pantry_unopened_min_days", "pantry_unopened_max_days"),
        ("pantry_opened_min_days", "pantry_opened_max_days"),
    ],
}


def expiration_for_storage(lookup, temp_category):
    """Return expiration days for a storage method, averaging min/max.

    Falls back to default_expiration_days when no data exists for the method.
    """
    fields = _STORAGE_FIELDS.get(temp_category)
    if fields is None:
        return lookup.default_expiration_days

    # room_temperature has two fallback pairs (unopened, then opened)
    pairs = fields if isinstance(fields, list) else [fields]

    for min_field, max_field in pairs:
        max_val = getattr(lookup, max_field)
        if max_val:
            min_val = getattr(lookup, min_field) or max_val
            return (min_val + max_val) // 2

    return lookup.default_expiration_days


def get_or_create_lookup(name, temp_category, shelf_name, expiration_days):
    """Find an existing lookup entry or create one for a custom ingredient.

    Bumps times_added_by_user if found. Creates a new user-generated
    lookup entry if not.
    """
    lookup = IngredientLookup.query.filter(
        IngredientLookup.ingredient_name.ilike(name)
    ).first()

    if lookup:
        lookup.times_added_by_user = (lookup.times_added_by_user or 0) + 1
        return lookup

    lookup = IngredientLookup(
        ingredient_name=name,
        category="",
        subcategory="",
        default_expiration_days=expiration_days,
        default_temperature_category=temp_category,
        default_shelf_name=shelf_name,
        keywords=name,
        is_seed_data=False,
        times_added_by_user=1,
    )
    db.session.add(lookup)
    db.session.flush()
    return lookup
