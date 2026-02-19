export const CATEGORIES = ["Fridge", "Freezer", "Pantry"];

export const SHELVES_BY_CATEGORY = {
  Fridge: [
    "Produce", "Dairy", "Eggs", "Meat", "Deli & Prepared",
    "Beverages", "Condiments & Sauces", "Fresh Herbs",
  ],
  Freezer: [
    "Ice Cream & Desserts", "Frozen Meals", "Frozen Proteins",
    "Frozen Fruits & Veggies", "Frozen Breads & Dough", "Frozen Snacks",
  ],
  Pantry: [
    "Breakfast & Cereals", "Grains & Rice", "Pasta & Noodles",
    "Baking Essentials", "Baking Mixes", "Canned Goods",
    "Sauces & Condiments", "Oils & Vinegars", "Spices",
    "Coffee & Tea", "Snacks", "Nuts & Dried Fruit", "Sweeteners", "Pantry",
  ],
};

export const DEFAULT_SHELVES = {
  Fridge: ["Produce", "Dairy", "Meat", "Beverages"],
  Freezer: ["Frozen Fruits & Veggies", "Frozen Meals"],
  Pantry: ["Breakfast & Cereals", "Grains & Rice", "Baking Essentials", "Spices"],
};
