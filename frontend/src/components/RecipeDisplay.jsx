import './RecipeDisplay.css'

function RecipeDisplay({ recipe }) {
  if (!recipe) return null

  const {
    recipe_name,
    description,
    source_attribution,
    chef_attribution,
    source_url,
    ingredients = [],
    instructions = [],
    prep_time,
    cook_time,
    total_time,
    servings,
    difficulty,
    tags = [],
  } = recipe

  // Build attribution text
  let attributionText = ''
  if (source_attribution) attributionText += source_attribution
  if (chef_attribution) {
    attributionText += attributionText ? ` · ${chef_attribution}` : chef_attribution
  }

  return (
    <div className="recipe-display">
      <h2 className="recipe-display__name">{recipe_name}</h2>

      {description && (
        <p className="recipe-display__description">{description}</p>
      )}

      {attributionText && (
        <p className="recipe-display__attribution">
          {source_url ? (
            <a href={source_url} target="_blank" rel="noopener noreferrer">
              {attributionText}
            </a>
          ) : (
            attributionText
          )}
        </p>
      )}

      <div className="recipe-display__meta">
        {prep_time && (
          <div className="recipe-display__meta-pill">
            <span>Prep</span> {prep_time}
          </div>
        )}
        {cook_time && (
          <div className="recipe-display__meta-pill">
            <span>Cook</span> {cook_time}
          </div>
        )}
        {total_time && (
          <div className="recipe-display__meta-pill">
            <span>Total</span> {total_time}
          </div>
        )}
        {servings && (
          <div className="recipe-display__meta-pill">
            <span>Serves</span> {servings}
          </div>
        )}
        {difficulty && (
          <div className="recipe-display__meta-pill">
            {difficulty}
          </div>
        )}
      </div>

      <h3 className="recipe-display__section-title">Ingredients</h3>
      <ul className="recipe-display__ingredients">
        {ingredients.map((ing, idx) => (
          <li
            key={idx}
            className={`recipe-display__ingredient ${
              ing.in_stock
                ? 'recipe-display__ingredient--in-stock'
                : 'recipe-display__ingredient--need-buy'
            }`}
          >
            <span className="recipe-display__ingredient-icon">
              {ing.in_stock ? '✓' : '○'}
            </span>
            <span>
              {ing.amount} {ing.item}
              {!ing.in_stock && (
                <span className="recipe-display__need-buy-label">(need to buy)</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <h3 className="recipe-display__section-title">Instructions</h3>
      <ol className="recipe-display__instructions">
        {instructions.map((step, idx) => (
          <li key={idx} className="recipe-display__step">
            <span className="recipe-display__step-number">{idx + 1}</span>
            <span className="recipe-display__step-text">{step}</span>
          </li>
        ))}
      </ol>

      {tags.length > 0 && (
        <div className="recipe-display__tags">
          {tags.map((tag, idx) => (
            <span key={idx} className="recipe-display__tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default RecipeDisplay
