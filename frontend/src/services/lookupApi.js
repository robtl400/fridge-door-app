import { apiGet } from "./apiClient";

export function searchLookup(query) {
  return apiGet(`/lookup/search?q=${encodeURIComponent(query)}`);
}

export function getLookupDetails(ingredientName) {
  return apiGet(`/lookup/${encodeURIComponent(ingredientName)}`).catch(() => null);
}
