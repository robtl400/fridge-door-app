import { useState, useEffect, useRef } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CircularProgress from "@mui/material/CircularProgress";
import { daysLabel, daysClass } from "../utils/dateFormat";
import "../pages/Home.css";

const CATEGORIES = ["Fridge", "Freezer", "Pantry"];

const SHELVES_BY_CATEGORY = {
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

function pillClass(item, editing) {
  const days = item.days_until_expiration;
  let cls = "ingredient-pill";
  if (days <= 0) cls += " ingredient-pill--expired";
  else if (item.is_expiring_soon) cls += " ingredient-pill--expiring";
  if (editing) cls += " ingredient-pill--editing";
  return cls;
}

const TOSS_OPTIONS = [
  { label: "Tossed a bit", amount: 1 },
  { label: "Tossed a bunch", amount: 2 },
  { label: "Tossed it all", amount: 3 },
];

function IngredientItem({ item, onToss, onEaten, onQuantityChange, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [showTossOptions, setShowTossOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayQty, setDisplayQty] = useState(item.quantity || 1);
  const days = item.days_until_expiration;

  // Edit state
  const [editName, setEditName] = useState(item.ingredient_name);
  const [editExpiration, setEditExpiration] = useState(String(item.expiration_days || ""));
  const [editCategory, setEditCategory] = useState(item.temperature_category || "Fridge");
  const [editShelf, setEditShelf] = useState(item.shelf_name || "");
  const nameRef = useRef(null);

  useEffect(() => {
    setDisplayQty(item.quantity || 1);
  }, [item.quantity]);

  // Reset edit state when item changes
  useEffect(() => {
    setEditName(item.ingredient_name);
    setEditExpiration(String(item.expiration_days || ""));
    setEditCategory(item.temperature_category || "Fridge");
    setEditShelf(item.shelf_name || "");
  }, [item.ingredient_name, item.expiration_days, item.temperature_category, item.shelf_name]);

  const handleQtyUp = async (e) => {
    e.stopPropagation();
    if (displayQty >= 5) return;
    const prev = displayQty;
    const next = prev + 1;
    setDisplayQty(next);
    try {
      await onQuantityChange(item.id, next);
    } catch {
      setDisplayQty(prev);
    }
  };

  const handleQtyDown = async (e) => {
    e.stopPropagation();
    if (displayQty <= 1) return;
    const prev = displayQty;
    const next = prev - 1;
    setDisplayQty(next);
    try {
      await onQuantityChange(item.id, next);
    } catch {
      setDisplayQty(prev);
    }
  };

  const handlePillClick = () => {
    if (loading) return;
    if (showTossOptions) {
      setShowTossOptions(false);
      setExpanded(false);
    } else {
      setExpanded(!expanded);
    }
  };

  const handleEaten = async (e) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onEaten(item.id);
    } catch {
      setLoading(false);
    }
  };

  const handleTossClick = (e) => {
    e.stopPropagation();
    setShowTossOptions(true);
  };

  const handleTossOption = async (e, amount) => {
    e.stopPropagation();
    setLoading(true);
    try {
      await onToss(item.id, amount);
    } catch {
      setLoading(false);
      setShowTossOptions(false);
    }
  };

  // Auto-save field on blur
  const handleFieldBlur = (field, value) => {
    if (!onUpdate) return;
    const original = {
      ingredient_name: item.ingredient_name,
      expiration: String(item.expiration_days || ""),
      temperature_category: item.temperature_category,
      shelf_name: item.shelf_name,
    };
    if (field === "ingredient_name" && value !== original.ingredient_name && value.trim()) {
      onUpdate(item.id, { ingredient_name: value.trim() });
    } else if (field === "expiration" && value !== original.expiration && value.trim()) {
      onUpdate(item.id, { expiration: value.trim() });
    } else if (field === "temperature_category" && value !== original.temperature_category) {
      onUpdate(item.id, { temperature_category: value });
    } else if (field === "shelf_name" && value !== original.shelf_name && value.trim()) {
      onUpdate(item.id, { shelf_name: value.trim() });
    }
  };

  // Handle category change — also auto-update shelf
  const handleCategoryChange = (e) => {
    e.stopPropagation();
    const newCat = e.target.value;
    setEditCategory(newCat);
    const newShelf = SHELVES_BY_CATEGORY[newCat]?.[0] || "";
    setEditShelf(newShelf);
    if (onUpdate) {
      onUpdate(item.id, { temperature_category: newCat, shelf_name: newShelf });
    }
  };

  // Compact pill view (not expanded)
  if (!expanded) {
    return (
      <span
        className={pillClass(item, false)}
        onClick={handlePillClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handlePillClick()}
      >
        <span className="ingredient-pill__qty-controls">
          <button
            className="ingredient-pill__qty-arrow"
            onClick={handleQtyUp}
            disabled={displayQty >= 5}
            aria-label="Increase quantity"
          >
            <KeyboardArrowUpIcon sx={{ fontSize: 12 }} />
          </button>
          <span className="ingredient-pill__qty-value">
            {displayQty >= 5 ? "5+" : displayQty <= 1 ? "\u2013" : displayQty}
          </span>
          <button
            className="ingredient-pill__qty-arrow"
            onClick={handleQtyDown}
            disabled={displayQty <= 1}
            aria-label="Decrease quantity"
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 12 }} />
          </button>
        </span>

        <span className="ingredient-pill__name">{item.ingredient_name}</span>

        <span
          className={`ingredient-pill__days ingredient-pill__days--${daysClass(days)}`}
        >
          {daysLabel(days)}
        </span>
      </span>
    );
  }

  // Expanded editing view
  return (
    <div
      className={pillClass(item, true)}
      onClick={handlePillClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && !e.target.closest("input, select") && handlePillClick()}
    >
      {/* Top row: name + action buttons */}
      <div className="ingredient-pill__edit-top">
        <span className="ingredient-pill__qty-controls">
          <button className="ingredient-pill__qty-arrow" onClick={handleQtyUp} disabled={displayQty >= 5}>
            <KeyboardArrowUpIcon sx={{ fontSize: 12 }} />
          </button>
          <span className="ingredient-pill__qty-value">
            {displayQty >= 5 ? "5+" : displayQty <= 1 ? "\u2013" : displayQty}
          </span>
          <button className="ingredient-pill__qty-arrow" onClick={handleQtyDown} disabled={displayQty <= 1}>
            <KeyboardArrowDownIcon sx={{ fontSize: 12 }} />
          </button>
        </span>

        <input
          ref={nameRef}
          className="ingredient-pill__edit-input ingredient-pill__edit-input--name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={() => handleFieldBlur("ingredient_name", editName)}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
        />

        {loading ? (
          <CircularProgress size={16} sx={{ color: "var(--color-warm-gray)", ml: "auto" }} />
        ) : showTossOptions ? (
          <span className="ingredient-pill__toss-options" onClick={(e) => e.stopPropagation()}>
            {TOSS_OPTIONS.map(({ label, amount }) => (
              <button
                key={amount}
                className="ingredient-pill__toss-btn"
                onClick={(e) => handleTossOption(e, amount)}
              >
                {label}
              </button>
            ))}
          </span>
        ) : (
          <div className="ingredient-pill__action-stack">
            <button
              className="ingredient-pill__action-btn ingredient-pill__action-btn--toss"
              onClick={handleTossClick}
            >
              <DeleteOutlineIcon sx={{ fontSize: 14 }} />
              Tossed
            </button>
            <button
              className="ingredient-pill__action-btn ingredient-pill__action-btn--use"
              onClick={handleEaten}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
              Eaten!
            </button>
          </div>
        )}
      </div>

      {/* Bottom row: editable fields */}
      <div className="ingredient-pill__edit-fields" onClick={(e) => e.stopPropagation()}>
        <input
          className="ingredient-pill__edit-input"
          value={editExpiration}
          onChange={(e) => setEditExpiration(e.target.value)}
          onBlur={() => handleFieldBlur("expiration", editExpiration)}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          placeholder="Exp"
          title={`Expiration: ${daysLabel(parseInt(editExpiration))}`}
        />
        <select
          className="ingredient-pill__edit-select"
          value={editCategory}
          onChange={handleCategoryChange}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          className="ingredient-pill__edit-input"
          value={editShelf}
          onChange={(e) => setEditShelf(e.target.value)}
          onBlur={() => handleFieldBlur("shelf_name", editShelf)}
          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          list={`pill-shelf-${item.id}`}
          placeholder="Shelf"
        />
        <datalist id={`pill-shelf-${item.id}`}>
          {(SHELVES_BY_CATEGORY[editCategory] || []).map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
    </div>
  );
}

export default IngredientItem;
