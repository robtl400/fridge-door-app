import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CircularProgress from "@mui/material/CircularProgress";
import "../pages/Home.css";

function daysLabel(days) {
  if (days === null || days === undefined) return "?";
  if (days < 0) return "Expired";
  if (days === 0) return "Today";
  if (days === 1) return "1d";
  return `${days}d`;
}

function daysClass(days) {
  if (days === null || days === undefined) return "soon";
  if (days <= 0) return "expired";
  if (days <= 3) return "urgent";
  if (days <= 7) return "soon";
  return "fresh";
}

function pillClass(item) {
  const days = item.days_until_expiration;
  if (days <= 0) return "ingredient-pill ingredient-pill--expired";
  if (item.is_expiring_soon) return "ingredient-pill ingredient-pill--expiring";
  return "ingredient-pill";
}

const TOSS_OPTIONS = [
  { label: "Tossed a bit", amount: 1 },
  { label: "Tossed a bunch", amount: 2 },
  { label: "Tossed it all", amount: 3 },
];

function IngredientItem({ item, onToss, onEaten }) {
  const [expanded, setExpanded] = useState(false);
  const [showTossOptions, setShowTossOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const days = item.days_until_expiration;

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

  return (
    <span
      className={pillClass(item)}
      onClick={handlePillClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handlePillClick()}
    >
      <span className="ingredient-pill__name">{item.ingredient_name}</span>

      {item.quantity > 1 && (
        <span className="ingredient-pill__qty">x{item.quantity}</span>
      )}

      <span
        className={`ingredient-pill__days ingredient-pill__days--${daysClass(days)}`}
      >
        {daysLabel(days)}
      </span>

      {loading && (
        <span className="ingredient-pill__actions">
          <CircularProgress size={16} sx={{ color: "var(--color-warm-gray)" }} />
        </span>
      )}

      {expanded && !showTossOptions && !loading && (
        <span className="ingredient-pill__actions">
          <button
            className="ingredient-pill__action-btn ingredient-pill__action-btn--toss"
            onClick={handleTossClick}
            title="Tossed"
            aria-label="Tossed"
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            className="ingredient-pill__action-btn ingredient-pill__action-btn--use"
            onClick={handleEaten}
            title="Eaten!"
            aria-label="Eaten!"
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
          </button>
        </span>
      )}

      {showTossOptions && !loading && (
        <span className="ingredient-pill__toss-options">
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
      )}
    </span>
  );
}

export default IngredientItem;
