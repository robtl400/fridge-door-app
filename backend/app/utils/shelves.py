# Canonical shelf display order per the seed data spec.
# Shelves not listed here sort to the end alphabetically.

SHELF_ORDER = [
    # Fridge
    "Produce",
    "Dairy",
    "Eggs",
    "Meat",
    "Deli & Prepared",
    "Beverages",
    "Condiments & Sauces",
    "Fresh Herbs",
    # Freezer
    "Ice Cream & Desserts",
    "Frozen Meals",
    "Frozen Proteins",
    "Frozen Fruits & Veggies",
    "Frozen Breads & Dough",
    "Frozen Snacks",
    # Pantry
    "Breakfast & Cereals",
    "Grains & Rice",
    "Pasta & Noodles",
    "Baking Essentials",
    "Baking Mixes",
    "Canned Goods",
    "Sauces & Condiments",
    "Oils & Vinegars",
    "Spices",
    "Coffee & Tea",
    "Snacks",
    "Nuts & Dried Fruit",
    "Sweeteners",
    "Pantry",
]

_SHELF_INDEX = {name: i for i, name in enumerate(SHELF_ORDER)}
_FALLBACK = len(SHELF_ORDER)

CATEGORY_ORDER = ["Fridge", "Freezer", "Pantry"]
_CAT_INDEX = {name: i for i, name in enumerate(CATEGORY_ORDER)}
_CAT_FALLBACK = len(CATEGORY_ORDER)


def get_shelf_sort_key(shelf_name):
    return _SHELF_INDEX.get(shelf_name, _FALLBACK)


def get_category_sort_key(category):
    return _CAT_INDEX.get(category, _CAT_FALLBACK)
