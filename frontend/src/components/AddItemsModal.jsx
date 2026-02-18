import { useState, useEffect, useRef } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import { searchLookup, getLookupDetails } from "../services/lookupApi";
import { addIngredients } from "../services/ingredientApi";
import "./AddItemsModal.css";

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

const CATEGORIES = ["Fridge", "Freezer", "Pantry"];

// Seed data uses lowercase temp categories; normalize to display values
const TEMP_CATEGORY_MAP = {
  refrigerated: "Fridge",
  frozen: "Freezer",
  pantry: "Pantry",
  Fridge: "Fridge",
  Freezer: "Freezer",
  Pantry: "Pantry",
};

function normalizeTempCategory(raw) {
  return TEMP_CATEGORY_MAP[raw] || "Fridge";
}

// Mirrors backend expiration_for_storage() logic
function calculateExpiration(lookupData, tempCategory) {
  if (!lookupData?.storage_methods) {
    return lookupData?.default_expiration_days || 7;
  }

  const methods = lookupData.storage_methods;
  let data;

  switch (tempCategory) {
    case "Fridge":
      data = methods.refrigerated;
      break;
    case "Freezer":
      data = methods.frozen;
      break;
    case "Pantry":
      data = methods.pantry_unopened || methods.pantry_opened;
      break;
  }

  if (data && data.min_days != null && data.max_days != null) {
    return Math.round((data.min_days + data.max_days) / 2);
  }

  return lookupData?.default_expiration_days || 7;
}

function toTitleCase(str) {
  return str.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}

let itemIdCounter = 0;

function AddItemsModal({ open, onClose, kitchenKey, onItemsAdded }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const [items, setItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Debounced search (300ms)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLookup(searchQuery);
        setSuggestions(results);
        setShowDropdown(true);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setSuggestions([]);
      setShowDropdown(false);
      setItems([]);
      setErrors({});
    }
  }, [open]);

  // Focus search bar on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 150);
    }
  }, [open]);

  const addItemFromLookup = async (searchResult) => {
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);

    // Fetch full details for storage-specific expiration recalculation
    let fullData = null;
    try {
      fullData = await getLookupDetails(searchResult.ingredient_name);
    } catch {
      // Fall back to search result defaults
    }

    const tempCategory = normalizeTempCategory(
      searchResult.default_temperature_category
    );
    const expDays = fullData
      ? calculateExpiration(fullData, tempCategory)
      : searchResult.default_expiration_days;

    const newItem = {
      id: ++itemIdCounter,
      ingredientName: searchResult.ingredient_name,
      quantity: null,
      expiration: String(expDays),
      temperatureCategory: tempCategory,
      shelfName:
        searchResult.default_shelf_name ||
        SHELVES_BY_CATEGORY[tempCategory][0],
      lookupData: fullData,
    };

    setItems((prev) => [...prev, newItem]);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[newItem.id];
      delete next._form;
      return next;
    });
    searchInputRef.current?.focus();
  };

  const addCustomItem = () => {
    const name = searchQuery.trim();
    if (!name) return;

    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);

    const newItem = {
      id: ++itemIdCounter,
      ingredientName: toTitleCase(name),
      quantity: null,
      expiration: "7",
      temperatureCategory: "Fridge",
      shelfName: "Produce",
      lookupData: null,
    };

    setItems((prev) => [...prev, newItem]);
    searchInputRef.current?.focus();
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const updateItem = (itemId, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, [field]: value };

        // Auto-recalculate expiration when temp category changes
        if (field === "temperatureCategory" && item.lookupData) {
          updated.expiration = String(
            calculateExpiration(item.lookupData, value)
          );
          updated.shelfName =
            SHELVES_BY_CATEGORY[value]?.[0] || item.shelfName;
        }

        return updated;
      })
    );

    // Clear field-level error
    setErrors((prev) => {
      const itemErrors = prev[itemId];
      if (!itemErrors) return prev;
      const next = { ...prev, [itemId]: { ...itemErrors } };
      delete next[itemId][field];
      if (Object.keys(next[itemId]).length === 0) delete next[itemId];
      return next;
    });
  };

  const handleQuantityChange = (itemId, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const current = item.quantity || 0;
        const next = current + delta;
        return { ...item, quantity: next < 1 ? null : next };
      })
    );
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) {
      if (e.key === "Enter" && searchQuery.trim()) {
        e.preventDefault();
        addCustomItem();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        addItemFromLookup(suggestions[highlightedIndex]);
      } else if (highlightedIndex === suggestions.length) {
        addCustomItem();
      } else {
        addItemFromLookup(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    let valid = true;

    for (const item of items) {
      const itemErrors = {};
      if (!item.ingredientName.trim()) {
        itemErrors.ingredientName = true;
        valid = false;
      }
      if (!item.expiration.trim()) {
        itemErrors.expiration = true;
        valid = false;
      }
      if (!item.temperatureCategory) {
        itemErrors.temperatureCategory = true;
        valid = false;
      }
      if (!item.shelfName.trim()) {
        itemErrors.shelfName = true;
        valid = false;
      }
      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.id] = itemErrors;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (items.length === 0 || !validate()) return;

    setIsSubmitting(true);
    try {
      const payload = items.map((item) => ({
        ingredient_name: item.ingredientName,
        quantity: item.quantity || 1,
        temperature_category: item.temperatureCategory,
        shelf_name: item.shelfName,
        expiration: item.expiration,
      }));

      await addIngredients(kitchenKey, payload);
      onItemsAdded?.(items.length);
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      setErrors((prev) => ({
        ...prev,
        _form: "Failed to add items. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  const addButton = (
    <button
      className="add-items-submit-btn"
      onClick={handleSubmit}
      disabled={items.length === 0 || isSubmitting}
    >
      {isSubmitting ? (
        <CircularProgress size={20} sx={{ color: "#fff" }} />
      ) : (
        `Add All Items (${items.length})`
      )}
    </button>
  );

  return (
    <div className="add-items-backdrop" onClick={onClose}>
      <div
        className="add-items-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="add-items-header">
          <h2 className="add-items-title">Add Items</h2>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </div>

        {/* Search */}
        <div className="add-items-search-wrap">
          <div className="add-items-search" ref={searchContainerRef}>
            <SearchIcon
              sx={{ fontSize: 20, color: "var(--color-warm-gray)" }}
            />
            <input
              ref={searchInputRef}
              type="text"
              className="add-items-search__input"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                suggestions.length > 0 && setShowDropdown(true)
              }
            />
            {isSearching && (
              <CircularProgress
                size={16}
                sx={{ color: "var(--color-warm-gray)" }}
              />
            )}
          </div>

          {showDropdown && (
            <div className="add-items-dropdown" ref={dropdownRef}>
              {suggestions.map((s, i) => (
                <button
                  key={s.ingredient_name}
                  className={`add-items-dropdown__item ${
                    i === highlightedIndex
                      ? "add-items-dropdown__item--active"
                      : ""
                  }`}
                  onClick={() => addItemFromLookup(s)}
                  onMouseEnter={() => setHighlightedIndex(i)}
                >
                  <span className="add-items-dropdown__name">
                    {s.ingredient_name}
                  </span>
                  <span className="add-items-dropdown__meta">
                    {s.default_expiration_days}d &middot;{" "}
                    {normalizeTempCategory(s.default_temperature_category)}
                  </span>
                </button>
              ))}
              {searchQuery.trim() && (
                <button
                  className={`add-items-dropdown__item add-items-dropdown__item--custom ${
                    highlightedIndex === suggestions.length
                      ? "add-items-dropdown__item--active"
                      : ""
                  }`}
                  onClick={addCustomItem}
                  onMouseEnter={() =>
                    setHighlightedIndex(suggestions.length)
                  }
                >
                  Add &ldquo;{searchQuery.trim()}&rdquo; as custom item
                </button>
              )}
            </div>
          )}
        </div>

        {/* Form-level error */}
        {errors._form && (
          <div className="add-items-error">{errors._form}</div>
        )}

        {/* To Be Added list */}
        <div className="add-items-list">
          {items.length > 0 && addButton}

          {items.length === 0 && (
            <div className="add-items-empty">
              Search for ingredients above to get started
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className={`add-items-card ${
                errors[item.id] ? "add-items-card--error" : ""
              }`}
            >
              {/* Row 1: Quantity, Name, Remove */}
              <div className="add-items-card__row1">
                <div className="add-items-qty">
                  <button
                    className="add-items-qty__btn"
                    onClick={() => handleQuantityChange(item.id, -1)}
                    aria-label="Decrease quantity"
                  >
                    &minus;
                  </button>
                  <span className="add-items-qty__value">
                    {item.quantity ?? "\u2013"}
                  </span>
                  <button
                    className="add-items-qty__btn"
                    onClick={() => handleQuantityChange(item.id, 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <span className="add-items-card__name">
                  {item.ingredientName}
                </span>
                <button
                  className="add-items-card__remove"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.ingredientName}`}
                >
                  &times;
                </button>
              </div>

              {/* Row 2: Expiration, Category, Shelf */}
              <div className="add-items-card__row2">
                <div className="add-items-field">
                  <label className="add-items-field__label">Expires</label>
                  <input
                    type="text"
                    className={`add-items-field__input ${
                      errors[item.id]?.expiration
                        ? "add-items-field__input--error"
                        : ""
                    }`}
                    value={item.expiration}
                    onChange={(e) =>
                      updateItem(item.id, "expiration", e.target.value)
                    }
                    placeholder="7, 2/20"
                  />
                </div>

                <div className="add-items-field">
                  <label className="add-items-field__label">Storage</label>
                  <select
                    className="add-items-field__select"
                    value={item.temperatureCategory}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "temperatureCategory",
                        e.target.value
                      )
                    }
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="add-items-field">
                  <label className="add-items-field__label">Shelf</label>
                  <input
                    type="text"
                    className={`add-items-field__input ${
                      errors[item.id]?.shelfName
                        ? "add-items-field__input--error"
                        : ""
                    }`}
                    value={item.shelfName}
                    onChange={(e) =>
                      updateItem(item.id, "shelfName", e.target.value)
                    }
                    list={`shelf-opts-${item.id}`}
                    placeholder="Shelf name"
                  />
                  <datalist id={`shelf-opts-${item.id}`}>
                    {(
                      SHELVES_BY_CATEGORY[item.temperatureCategory] || []
                    ).map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          ))}

          {items.length > 3 && addButton}
        </div>
      </div>
    </div>
  );
}

export default AddItemsModal;
