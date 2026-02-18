import { useState, useEffect, useCallback } from "react";
import { Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useKitchen } from "../context/KitchenContext";
import { fetchExpiringSoon, tossIngredient, deleteIngredient } from "../services/ingredientApi";
import IngredientItem from "./IngredientItem";
import "../pages/Home.css";

function TopShelf({ refreshKey, onDataChange, showToast }) {
  const { kitchenKey } = useKitchen();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!kitchenKey) return;
    try {
      const result = await fetchExpiringSoon(kitchenKey);
      setData(result);
    } catch (err) {
      console.error("TopShelf fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [kitchenKey]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData, refreshKey]);

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

  if (loading) {
    return (
      <div className="top-shelf">
        <div className="skeleton-block" style={{ width: 200, height: 24, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skeleton-block" style={{ width: 120, height: 32 }} />
          <div className="skeleton-block" style={{ width: 100, height: 32 }} />
          <div className="skeleton-block" style={{ width: 140, height: 32 }} />
        </div>
      </div>
    );
  }

  if (!data || data.count === 0) {
    return (
      <div className="top-shelf">
        <div className="top-shelf__empty">
          <Typography variant="body1">Nothing expiring soon!</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="top-shelf">
      <div className="top-shelf__header">
        <WarningAmberIcon sx={{ fontSize: 20, color: "#c4785b" }} />
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          {data.count} item{data.count !== 1 ? "s" : ""} expiring within{" "}
          {data.threshold_days} day{data.threshold_days !== 1 ? "s" : ""}
        </Typography>
      </div>

      <div className="top-shelf__scroll">
        {data.items.map((item) => (
          <IngredientItem
            key={item.id}
            item={{ ...item, is_expiring_soon: true }}
            onToss={handleToss}
            onEaten={handleEaten}
          />
        ))}
      </div>
    </div>
  );
}

export default TopShelf;
