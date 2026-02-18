const API_BASE = "/api";

export async function suggestRecipe(kitchenKey, ingredients, dietaryRestrictions = []) {
  const res = await fetch(`${API_BASE}/kitchen/${kitchenKey}/recipes/suggest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ingredients,
      dietary_restrictions: dietaryRestrictions,
    }),
  });

  if (res.status === 429) {
    const data = await res.json();
    const err = new Error(data.error || "Rate limit reached. Please wait a moment and try again.");
    err.status = 429;
    err.retryAfter = data.retry_after || 60;
    throw err;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to get recipe suggestion");
  }

  return res.json();
}
