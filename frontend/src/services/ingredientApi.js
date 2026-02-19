import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from "./apiClient";

export function fetchIngredients(kitchenKey) {
  return apiGet(`/kitchen/${kitchenKey}/ingredients`);
}

export function fetchExpiringSoon(kitchenKey) {
  return apiGet(`/kitchen/${kitchenKey}/ingredients/expiring-soon`);
}

export function addIngredients(kitchenKey, items) {
  return apiPost(`/kitchen/${kitchenKey}/ingredients`, items);
}

export function updateIngredient(kitchenKey, id, data) {
  return apiPut(`/kitchen/${kitchenKey}/ingredients/${id}`, data);
}

export function deleteIngredient(kitchenKey, id) {
  return apiDelete(`/kitchen/${kitchenKey}/ingredients/${id}`);
}

export function tossIngredient(kitchenKey, id, amount = 3) {
  return apiPatch(`/kitchen/${kitchenKey}/ingredients/${id}/toss`, { amount });
}
