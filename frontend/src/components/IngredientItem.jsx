import { useState } from "react";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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

function IngredientItem({ item, onToss, onUseUp }) {
  const [expanded, setExpanded] = useState(false);
  const days = item.days_until_expiration;

  const handleToss = (e) => {
    e.stopPropagation();
    setExpanded(false);
    onToss(item.id);
  };

  const handleUseUp = (e) => {
    e.stopPropagation();
    setExpanded(false);
    onUseUp(item.id);
  };

  return (
    <span
      className={pillClass(item)}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
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

      {expanded && (
        <span className="ingredient-pill__actions">
          <button
            className="ingredient-pill__action-btn ingredient-pill__action-btn--toss"
            onClick={handleToss}
            title="Tossed"
            aria-label="Tossed"
          >
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </button>
          <button
            className="ingredient-pill__action-btn ingredient-pill__action-btn--use"
            onClick={handleUseUp}
            title="Used Up"
            aria-label="Used Up"
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
          </button>
        </span>
      )}
    </span>
  );
}

export default IngredientItem;
