# Canonical shelf display order per the seed data spec.
# Shelves not listed here sort to the end alphabetically.

SHELF_ORDER = [
    # Refrigerated
    "produce",
    "dairy",
    "eggs",
    "meat",
    "deli_prepared",
    "beverages",
    "condiments_sauces",
    "fresh_herbs",
    # Frozen
    "ice_cream_desserts",
    "frozen_meals",
    "frozen_proteins",
    "frozen_fruit_veg",
    "frozen_breads_dough",
    "frozen_snacks",
    # Pantry
    "breakfast_cereals",
    "grains_rice",
    "pasta_noodles",
    "baking_essentials",
    "baking_mixes",
    "canned_goods",
    "sauces_condiments",
    "oils_vinegars",
    "spices",
    "coffee_tea",
    "snacks",
    "nuts_dried_fruit",
    "sweeteners",
    "pantry",
]

_SHELF_INDEX = {name: i for i, name in enumerate(SHELF_ORDER)}
_FALLBACK = len(SHELF_ORDER)

CATEGORY_ORDER = ["refrigerated", "frozen", "room_temperature"]
_CAT_INDEX = {name: i for i, name in enumerate(CATEGORY_ORDER)}
_CAT_FALLBACK = len(CATEGORY_ORDER)


def get_shelf_sort_key(shelf_name):
    return _SHELF_INDEX.get(shelf_name, _FALLBACK)


def get_category_sort_key(category):
    return _CAT_INDEX.get(category, _CAT_FALLBACK)
