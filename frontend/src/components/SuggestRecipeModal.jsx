import { useState, useEffect, useRef } from 'react'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import CircularProgress from '@mui/material/CircularProgress'
import { fetchExpiringSoon, fetchIngredients } from '../services/ingredientApi'
import { suggestRecipe } from '../services/recipeApi'
import { daysLabel, daysClass } from '../utils/dateFormat'
import RecipeDisplay from './RecipeDisplay'
import './SuggestRecipeModal.css'

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Nut-free',
]

function SuggestRecipeModal({ open, onClose, kitchenKey }) {
  const [view, setView] = useState('select')

  const [expiringItems, setExpiringItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [supplementalItems, setSupplementalItems] = useState([])
  const [dataLoading, setDataLoading] = useState(false)

  const [checkedNames, setCheckedNames] = useState(new Set())
  const [customIngredients, setCustomIngredients] = useState([])

  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const [dietaryRestrictions, setDietaryRestrictions] = useState(new Set())
  const [otherRestriction, setOtherRestriction] = useState('')

  const [recipe, setRecipe] = useState(null)
  const [error, setError] = useState(null)

  const lastSubmission = useRef(null)
  const searchInputRef = useRef(null)
  const searchContainerRef = useRef(null)
  const dropdownRef = useRef(null)

  function flattenInventory(data) {
    const items = []
    const seen = new Set()
    const categories = data.ingredients || {}
    for (const category of Object.values(categories)) {
      for (const shelfItems of Object.values(category)) {
        for (const item of shelfItems) {
          if (!seen.has(item.ingredient_name)) {
            seen.add(item.ingredient_name)
            items.push(item)
          }
        }
      }
    }
    return items
  }

  // Fetch data when modal opens
  useEffect(() => {
    if (!open || !kitchenKey) return

    let cancelled = false
    setDataLoading(true)

    Promise.all([
      fetchExpiringSoon(kitchenKey),
      fetchIngredients(kitchenKey),
    ])
      .then(([expiringData, inventoryData]) => {
        if (cancelled) return

        const expItems = expiringData.items || []
        setExpiringItems(expItems)
        const inventory = flattenInventory(inventoryData)
        setAllItems(inventory)

        // Pre-check first 3 expiring items
        const preChecked = new Set()
        expItems.slice(0, 3).forEach((item) => preChecked.add(item.ingredient_name))
        setCheckedNames(preChecked)

        // If fewer than 5 expiring items, supplement from inventory (unchecked)
        if (expItems.length < 5) {
          const expiringNames = new Set(expItems.map((e) => e.ingredient_name))
          const supplement = inventory
            .filter((item) => !expiringNames.has(item.ingredient_name))
            .slice(0, 5 - expItems.length)
          setSupplementalItems(supplement)
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Failed to load ingredients:', err)
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false)
      })

    return () => { cancelled = true }
  }, [open, kitchenKey])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setView('select')
      setExpiringItems([])
      setAllItems([])
      setSupplementalItems([])
      setCheckedNames(new Set())
      setCustomIngredients([])
      setSearchQuery('')
      setShowDropdown(false)
      setDietaryRestrictions(new Set())
      setOtherRestriction('')
      setRecipe(null)
      setError(null)
      lastSubmission.current = null
    }
  }, [open])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleIngredient = (name) => {
    setCheckedNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const toggleDietary = (restriction) => {
    setDietaryRestrictions((prev) => {
      const next = new Set(prev)
      if (next.has(restriction)) {
        next.delete(restriction)
      } else {
        next.add(restriction)
      }
      return next
    })
  }

  const removeCustom = (name) => {
    setCustomIngredients((prev) => prev.filter((n) => n !== name))
    setCheckedNames((prev) => {
      const next = new Set(prev)
      next.delete(name)
      return next
    })
  }

  // Filter inventory items based on search query (client-side)
  const searchResults = searchQuery.trim()
    ? allItems.filter(
        (item) =>
          item.ingredient_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) &&
          !checkedNames.has(item.ingredient_name)
      )
    : []

  const queryMatchesInventory = searchQuery.trim() && allItems.some(
    (item) => item.ingredient_name.toLowerCase() === searchQuery.trim().toLowerCase()
  )

  useEffect(() => {
    if (searchQuery.trim() && (searchResults.length > 0 || !queryMatchesInventory)) {
      setShowDropdown(true)
      setHighlightedIndex(-1)
    } else {
      setShowDropdown(false)
    }
  }, [searchQuery, searchResults.length, queryMatchesInventory])

  const addFromSearch = (item) => {
    setCheckedNames((prev) => new Set(prev).add(item.ingredient_name))
    setSearchQuery('')
    setShowDropdown(false)
    searchInputRef.current?.focus()
  }

  const addCustom = () => {
    const name = searchQuery.trim()
    if (!name) return

    const titleCased = name.replace(
      /\b\w+/g,
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )

    if (!customIngredients.includes(titleCased)) {
      setCustomIngredients((prev) => [...prev, titleCased])
    }
    setCheckedNames((prev) => new Set(prev).add(titleCased))
    setSearchQuery('')
    setShowDropdown(false)
    searchInputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    const totalItems = searchResults.length + (searchQuery.trim() && !queryMatchesInventory ? 1 : 0)

    if (!showDropdown || totalItems === 0) {
      if (e.key === 'Enter' && searchQuery.trim()) {
        e.preventDefault()
        addCustom()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
        addFromSearch(searchResults[highlightedIndex])
      } else if (highlightedIndex === searchResults.length && !queryMatchesInventory) {
        addCustom()
      } else if (searchResults.length > 0) {
        addFromSearch(searchResults[0])
      } else {
        addCustom()
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const getSelectedIngredients = () => [...checkedNames]

  const getDietaryRestrictions = () => {
    const restrictions = [...dietaryRestrictions]
    if (otherRestriction.trim()) {
      restrictions.push(otherRestriction.trim())
    }
    return restrictions
  }

  const totalSelected = checkedNames.size

  const handleSubmit = async () => {
    const ingredients = getSelectedIngredients()
    if (ingredients.length === 0) return

    const restrictions = getDietaryRestrictions()
    lastSubmission.current = { ingredients, restrictions }

    setView('loading')
    setError(null)

    try {
      const result = await suggestRecipe(kitchenKey, ingredients, restrictions)
      setRecipe(result)
      setView('result')
    } catch (err) {
      setError(
        err.status === 429
          ? 'Recipe generation is temporarily limited. Please wait about a minute and try again.'
          : err.message || 'Something went wrong generating your recipe. Please try again.'
      )
      setView('error')
    }
  }

  const handleTryAnother = async () => {
    if (!lastSubmission.current) return

    const { ingredients, restrictions } = lastSubmission.current
    setView('loading')
    setError(null)

    try {
      const result = await suggestRecipe(kitchenKey, ingredients, restrictions)
      setRecipe(result)
      setView('result')
    } catch (err) {
      setError(
        err.status === 429
          ? 'Recipe generation is temporarily limited. Please wait about a minute and try again.'
          : err.message || 'Something went wrong generating your recipe. Please try again.'
      )
      setView('error')
    }
  }

  if (!open) return null

  return (
    <div className="suggest-recipe-backdrop" onClick={onClose}>
      <div
        className="suggest-recipe-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="suggest-recipe-header">
          <h2 className="suggest-recipe-title">
            {view === 'result' ? 'Your Recipe' : 'Suggest a Recipe'}
          </h2>
          <IconButton onClick={onClose} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </div>

        {/* === SELECTION VIEW === */}
        {view === 'select' && (
          <>
            <div className="suggest-recipe-content">
              {dataLoading ? (
                <div className="suggest-recipe-loading">
                  <CircularProgress size={28} sx={{ color: 'var(--color-terracotta)' }} />
                </div>
              ) : (
                <>
                  {/* Recipe should use (moved to TOP, renamed) */}
                  <div className="suggest-recipe-section">
                    <div className="suggest-recipe-section__title">
                      Recipe should use
                    </div>

                    {expiringItems.length === 0 && allItems.length === 0 ? (
                      <div className="suggest-recipe-empty">
                        No ingredients in your kitchen yet. Add items first!
                      </div>
                    ) : (
                      <div className="suggest-recipe-checkbox-list">
                        {/* Expiring items */}
                        {expiringItems.map((item) => (
                          <label
                            key={`exp-${item.id}`}
                            className="suggest-recipe-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={checkedNames.has(item.ingredient_name)}
                              onChange={() => toggleIngredient(item.ingredient_name)}
                            />
                            <span className="suggest-recipe-checkbox__label suggest-recipe-checkbox__label--expiring">
                              {item.ingredient_name}
                              <span className={`suggest-recipe-checkbox__days suggest-recipe-checkbox__days--${daysClass(item.days_until_expiration)}`}>
                                {daysLabel(item.days_until_expiration)}
                              </span>
                            </span>
                          </label>
                        ))}

                        {/* Supplemental in-stock items when < 5 expiring */}
                        {supplementalItems.length > 0 && (
                          <>
                            <div className="suggest-recipe-section__subtitle">
                              Also in your kitchen
                            </div>
                            {supplementalItems.map((item) => (
                              <label
                                key={`supp-${item.ingredient_name}`}
                                className="suggest-recipe-checkbox"
                              >
                                <input
                                  type="checkbox"
                                  checked={checkedNames.has(item.ingredient_name)}
                                  onChange={() => toggleIngredient(item.ingredient_name)}
                                />
                                <span className="suggest-recipe-checkbox__label">
                                  {item.ingredient_name}
                                  <span className={`suggest-recipe-checkbox__days suggest-recipe-checkbox__days--${daysClass(item.days_until_expiration)}`}>
                                    {daysLabel(item.days_until_expiration)}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </>
                        )}

                        {/* Non-expiring inventory items added via search */}
                        {[...checkedNames]
                          .filter(
                            (name) =>
                              !expiringItems.some((e) => e.ingredient_name === name) &&
                              !supplementalItems.some((s) => s.ingredient_name === name) &&
                              !customIngredients.includes(name)
                          )
                          .map((name) => (
                            <label
                              key={`inv-${name}`}
                              className="suggest-recipe-checkbox"
                            >
                              <input
                                type="checkbox"
                                checked={true}
                                onChange={() => toggleIngredient(name)}
                              />
                              <span className="suggest-recipe-checkbox__label">
                                {name}
                              </span>
                            </label>
                          ))}

                        {/* Custom ingredients as checkboxes */}
                        {customIngredients.map((name) => (
                          <label
                            key={`custom-${name}`}
                            className="suggest-recipe-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={checkedNames.has(name)}
                              onChange={() => toggleIngredient(name)}
                            />
                            <span className="suggest-recipe-checkbox__label">
                              {name}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Additional Ingredients (search, moved BELOW) */}
                  <div className="suggest-recipe-section">
                    <div className="suggest-recipe-section__title">
                      Additional Ingredients
                    </div>
                    <div className="suggest-recipe-search-wrap" ref={searchContainerRef}>
                      <div className="suggest-recipe-search">
                        <SearchIcon
                          sx={{ fontSize: 20, color: 'var(--color-warm-gray)' }}
                        />
                        <input
                          ref={searchInputRef}
                          type="text"
                          className="suggest-recipe-search__input"
                          placeholder="Search your inventory..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                      </div>

                      {showDropdown && (
                        <div className="suggest-recipe-dropdown" ref={dropdownRef}>
                          {searchResults.slice(0, 8).map((item, i) => (
                            <button
                              key={item.ingredient_name}
                              className={`suggest-recipe-dropdown__item ${
                                i === highlightedIndex
                                  ? 'suggest-recipe-dropdown__item--active'
                                  : ''
                              }`}
                              onClick={() => addFromSearch(item)}
                              onMouseEnter={() => setHighlightedIndex(i)}
                            >
                              <span>{item.ingredient_name}</span>
                              <span className={`suggest-recipe-dropdown__days suggest-recipe-dropdown__days--${daysClass(item.days_until_expiration)}`}>
                                {daysLabel(item.days_until_expiration)}
                              </span>
                            </button>
                          ))}
                          {searchQuery.trim() && !queryMatchesInventory && (
                            <button
                              className={`suggest-recipe-dropdown__item suggest-recipe-dropdown__item--custom ${
                                highlightedIndex === searchResults.length
                                  ? 'suggest-recipe-dropdown__item--active'
                                  : ''
                              }`}
                              onClick={addCustom}
                              onMouseEnter={() =>
                                setHighlightedIndex(searchResults.length)
                              }
                            >
                              Add &ldquo;{searchQuery.trim()}&rdquo; as custom ingredient
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Custom ingredient chips */}
                    {customIngredients.length > 0 && (
                      <div className="suggest-recipe-chips">
                        {customIngredients.map((name) => (
                          <span key={name} className="suggest-recipe-chip">
                            {name}
                            <button
                              className="suggest-recipe-chip__remove"
                              onClick={() => removeCustom(name)}
                              aria-label={`Remove ${name}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dietary Restrictions */}
                  <div className="suggest-recipe-section">
                    <div className="suggest-recipe-section__title">
                      Dietary Restrictions
                    </div>
                    <div className="suggest-recipe-dietary">
                      {DIETARY_OPTIONS.map((option) => (
                        <button
                          key={option}
                          className={`suggest-recipe-dietary-pill ${
                            dietaryRestrictions.has(option)
                              ? 'suggest-recipe-dietary-pill--active'
                              : ''
                          }`}
                          onClick={() => toggleDietary(option)}
                        >
                          {option}
                        </button>
                      ))}
                      <input
                        type="text"
                        className="suggest-recipe-other-input"
                        placeholder="Other..."
                        value={otherRestriction}
                        onChange={(e) => setOtherRestriction(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Submit */}
            <div className="suggest-recipe-footer">
              <button
                className="suggest-recipe-submit-btn"
                onClick={handleSubmit}
                disabled={totalSelected === 0 || dataLoading}
              >
                Get Recipe Suggestions
                {totalSelected > 0 && ` (${totalSelected} ingredient${totalSelected !== 1 ? 's' : ''})`}
              </button>
            </div>
          </>
        )}

        {/* === LOADING VIEW === */}
        {view === 'loading' && (
          <div className="suggest-recipe-content">
            <div className="suggest-recipe-loading">
              <CircularProgress size={36} sx={{ color: 'var(--color-terracotta)' }} />
              <span className="suggest-recipe-loading__text">
                Generating your recipe...
              </span>
            </div>
          </div>
        )}

        {/* === RESULT VIEW === */}
        {view === 'result' && recipe && (
          <>
            <div className="suggest-recipe-content">
              <RecipeDisplay recipe={recipe} />
            </div>
            <div className="suggest-recipe-actions">
              <button
                className="suggest-recipe-action-btn suggest-recipe-action-btn--primary"
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </button>
              <button
                className="suggest-recipe-action-btn suggest-recipe-action-btn--secondary"
                onClick={handleTryAnother}
              >
                Try Another Recipe
              </button>
            </div>
          </>
        )}

        {/* === ERROR VIEW === */}
        {view === 'error' && (
          <div className="suggest-recipe-content">
            <div className="suggest-recipe-error">
              {error}
            </div>
            <button
              className="suggest-recipe-submit-btn"
              onClick={() => setView('select')}
              style={{ margin: '0 0 16px' }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SuggestRecipeModal
