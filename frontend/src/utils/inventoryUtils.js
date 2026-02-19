import { DEFAULT_SHELVES } from "./constants";

export function mergeWithDefaults(ingredients) {
  const result = {};

  for (const [category, defaults] of Object.entries(DEFAULT_SHELVES)) {
    const userShelves = ingredients[category] || {};
    const userShelfNames = Object.keys(userShelves);

    result[category] = { ...userShelves };

    if (userShelfNames.length < defaults.length) {
      const needed = defaults.length - userShelfNames.length;
      const available = defaults.filter((d) => !userShelfNames.includes(d));
      for (const shelfName of available.slice(0, needed)) {
        result[category][shelfName] = [];
      }
    }
  }

  for (const category of Object.keys(ingredients)) {
    if (!result[category]) {
      result[category] = ingredients[category];
    }
  }

  return result;
}

export function flattenInventory(data) {
  const items = [];
  const seen = new Set();
  const categories = data.ingredients || {};
  for (const category of Object.values(categories)) {
    for (const shelfItems of Object.values(category)) {
      for (const item of shelfItems) {
        if (!seen.has(item.ingredient_name)) {
          seen.add(item.ingredient_name);
          items.push(item);
        }
      }
    }
  }
  return items;
}
