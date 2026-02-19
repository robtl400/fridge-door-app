import { useState, useEffect, useCallback, useRef } from "react";
import { Typography } from "@mui/material";
import { useKitchen } from "../context/KitchenContext";
import { fetchIngredients, tossIngredient, deleteIngredient, updateIngredient } from "../services/ingredientApi";
import IngredientItem from "./IngredientItem";
import "../pages/Home.css";

const DEFAULT_SHELVES = {
  Fridge: ["Produce", "Dairy", "Meat", "Beverages"],
  Freezer: ["Frozen Fruits & Veggies", "Frozen Meals"],
  Pantry: ["Breakfast & Cereals", "Grains & Rice", "Baking Essentials", "Spices"],
};

function mergeWithDefaults(ingredients) {
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

function ShelfView({ refreshKey, onDataChange, onCategoryChange, showToast }) {
  const { kitchenKey } = useKitchen();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef({});

  const loadData = useCallback(async () => {
    if (!kitchenKey) return;
    try {
      const result = await fetchIngredients(kitchenKey);
      setData(result);
    } catch (err) {
      console.error("ShelfView fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [kitchenKey]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData, refreshKey]);

  useEffect(() => {
    if (!onCategoryChange) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onCategoryChange(entry.target.dataset.category);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data, onCategoryChange]);

  const handleToss = async (id, amount) => {
    try {
      await tossIngredient(kitchenKey, id, amount);
      showToast?.("Ingredient tracked and removed");
      loadData();
      onDataChange?.();
    } catch (err) {
      console.error("Toss error:", err);
      showToast?.("Something went wrong. Please try again.", "error");
      throw err;
    }
  };

  const handleQuantityChange = async (id, newQuantity) => {
    await updateIngredient(kitchenKey, id, { quantity: newQuantity });
  };

  const handleEaten = async (id) => {
    try {
      await deleteIngredient(kitchenKey, id);
      showToast?.("Ingredient removed!");
      loadData();
      onDataChange?.();
    } catch (err) {
      console.error("Eaten error:", err);
      showToast?.("Something went wrong. Please try again.", "error");
      throw err;
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateIngredient(kitchenKey, id, data);
      loadData();
      onDataChange?.();
    } catch (err) {
      console.error("Update error:", err);
      showToast?.("Failed to update. Please try again.", "error");
    }
  };

  if (loading) {
    return (
      <div>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div className="skeleton-block" style={{ width: 120, height: 28, marginBottom: 12 }} />
            <div className="skeleton-block" style={{ height: 160 }} />
          </div>
        ))}
      </div>
    );
  }

  const rawIngredients = data?.ingredients || {};
  const ingredients = mergeWithDefaults(rawIngredients);
  const categories = Object.keys(ingredients);

  return (
    <div>
      {categories.map((category) => {
        const shelves = ingredients[category];
        const shelfNames = Object.keys(shelves);
        if (shelfNames.length === 0) return null;

        return (
          <div
            key={category}
            className="category-section"
            data-category={category}
            ref={(el) => { sectionRefs.current[category] = el; }}
          >
            <div className="category-section__title">{category}</div>

            <div className="shelf-grid">
              {shelfNames.map((shelf) => (
                <div key={shelf} className="shelf-card">
                  <div className="shelf-card__title">{shelf}</div>
                  <div className="shelf-card__items">
                    {shelves[shelf].length > 0 ? (
                      shelves[shelf].map((item) => (
                        <IngredientItem
                          key={item.id}
                          item={item}
                          onToss={handleToss}
                          onEaten={handleEaten}
                          onQuantityChange={handleQuantityChange}
                          onUpdate={handleUpdate}
                        />
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--color-warm-gray)", fontStyle: "italic", py: 1 }}
                      >
                        No items yet
                      </Typography>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ShelfView;
