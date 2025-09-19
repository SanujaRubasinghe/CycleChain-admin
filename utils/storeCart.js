const getJson = async (r) => {
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("application/json")) throw new Error(`Non-JSON response (${r.status})`);
  return r.json();
};

export const storeCartApi = {
  get: () => fetch("/api/store-cart", { credentials: "include" }).then(getJson),
  add: (productId, qty = 1) =>
    fetch("/api/store-cart", {
      method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ productId, qty }),
    }).then(getJson),
  update: (itemId, qty) =>
    fetch(`/api/store-cart/${itemId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
      body: JSON.stringify({ qty }),
    }).then(getJson),
  remove: (itemId) =>
    fetch(`/api/store-cart/${itemId}`, { method: "DELETE", credentials: "include" }).then(getJson),
  clear: () => fetch("/api/store-cart/clear", { method: "POST", credentials: "include" }).then(getJson),
  checkout: () => fetch("/api/store-cart/checkout", { method: "POST", credentials: "include" }).then(getJson),
};
