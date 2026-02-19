import { apiGet, apiPost, apiPut } from "./apiClient";

export function createKitchen({ username = null, name = null } = {}) {
  const body = {};
  if (username) body.username = username;
  if (name) body.name = name;
  return apiPost("/kitchens", body);
}

export function verifyKitchen(kitchenKey) {
  return apiGet(`/kitchens/${kitchenKey}`).catch((err) => {
    if (err.status === 404) return null;
    throw err;
  });
}

export function updateKitchenName(kitchenKey, name) {
  return apiPut(`/kitchens/${kitchenKey}`, { name });
}
