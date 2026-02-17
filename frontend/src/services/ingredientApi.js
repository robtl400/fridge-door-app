const API_BASE = "/api";

export async function fetchIngredients(kitchenKey) {
  const res = await fetch(`${API_BASE}/kitchen/${kitchenKey}/ingredients`);
  if (!res.ok) throw new Error("Failed to fetch ingredients");
  return res.json();
}

export async function fetchExpiringSoon(kitchenKey) {
  const res = await fetch(
    `${API_BASE}/kitchen/${kitchenKey}/ingredients/expiring-soon`
  );
  if (!res.ok) throw new Error("Failed to fetch expiring items");
  return res.json();
}

export async function addIngredients(kitchenKey, items) {
  const res = await fetch(`${API_BASE}/kitchen/${kitchenKey}/ingredients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(items),
  });
  if (!res.ok) throw new Error("Failed to add ingredients");
  return res.json();
}

export async function updateIngredient(kitchenKey, id, data) {
  const res = await fetch(
    `${API_BASE}/kitchen/${kitchenKey}/ingredients/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) throw new Error("Failed to update ingredient");
  return res.json();
}

export async function deleteIngredient(kitchenKey, id) {
  const res = await fetch(
    `${API_BASE}/kitchen/${kitchenKey}/ingredients/${id}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Failed to delete ingredient");
  return res.json();
}

export async function tossIngredient(kitchenKey, id, amount = 3) {
  const res = await fetch(
    `${API_BASE}/kitchen/${kitchenKey}/ingredients/${id}/toss`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    }
  );
  if (!res.ok) throw new Error("Failed to toss ingredient");
  return res.json();
}
