const API_BASE = "/api";

export async function createKitchen({ username = null, name = null } = {}) {
  const body = {};
  if (username) body.username = username;
  if (name) body.name = name;
  const res = await fetch(`${API_BASE}/kitchens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create kitchen");
  return res.json();
}

export async function verifyKitchen(kitchenKey) {
  const res = await fetch(`${API_BASE}/kitchens/${kitchenKey}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to verify kitchen");
  return res.json();
}

export async function updateKitchenName(kitchenKey, name) {
  const res = await fetch(`${API_BASE}/kitchens/${kitchenKey}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to update kitchen");
  return res.json();
}
