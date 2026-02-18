const API_BASE = "/api";

export async function searchLookup(query) {
  const res = await fetch(
    `${API_BASE}/lookup/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getLookupDetails(ingredientName) {
  const res = await fetch(
    `${API_BASE}/lookup/${encodeURIComponent(ingredientName)}`
  );
  if (!res.ok) return null;
  return res.json();
}
