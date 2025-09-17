"use client";

import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // --- API helpers (inline to avoid extra imports) ---
  const cartGet = async () => {
    const r = await fetch("/api/store-cart", { credentials: "include" });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || "Failed to load cart");
    return r.json();
  };
  const cartUpdate = (id, qty) =>
    fetch(`/api/store-cart/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ qty }),
    }).then((r) => r.json());
  const cartRemove = (id) =>
    fetch(`/api/store-cart/${id}`, { method: "DELETE", credentials: "include" }).then((r) => r.json());
  const cartClear = () =>
    fetch("/api/store-cart/clear", { method: "POST", credentials: "include" }).then((r) => r.json());
  const cartCheckout = () =>
    fetch("/api/store-cart/checkout", { method: "POST", credentials: "include" }).then((r) => r.json());

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await cartGet();
      setCart({
        items: Array.isArray(data.items) ? data.items : [],
        total: Number(data.total) || 0,
      });
    } catch (e) {
      setErr(e.message || "Failed to load cart");
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (id, next) => {
    if (next < 1) return;
    // optimistic UI
    const prev = cart;
    setCart({
      ...cart,
      items: cart.items.map((i) => (i._id === id ? { ...i, qty: next } : i)),
      total: cart.items.reduce(
        (s, i) => s + (i._id === id ? i.priceSnapshot * next : i.priceSnapshot * i.qty),
        0
      ),
    });
    try {
      const data = await cartUpdate(id, next);
      setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
    } catch {
      setCart(prev);
    }
  };

  const removeItem = async (id) => {
    const data = await cartRemove(id);
    setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
  };

  const clear = async () => {
    const data = await cartClear();
    setCart({ items: data.items ?? [], total: Number(data.total) || 0 });
  };

  const checkout = async () => {
    const payload = await cartCheckout();
    if (payload?.orderId) {
      alert(`Order ${payload.orderId}\nTotal LKR ${payload.total}`);
      // TODO: navigate to your payment route
    }
  };

  const items = Array.isArray(cart.items) ? cart.items : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-white">My Cart</h2>
          <a href="/store" className="btn btn-ghost">Continue shopping</a>
        </div>

        {loading && <div className="card p-5">Loading…</div>}
        {err && <div className="card p-5 text-red-400">{err}</div>}

        {!loading && items.length === 0 && !err && (
          <div className="card p-6 flex items-center justify-between">
            <span>Your cart is empty. Visit <a className="underline" href="/store">Store</a>.</span>
            <a href="/store" className="btn btn-primary">Shop now</a>
          </div>
        )}

        {/* Main layout */}
        {items.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Items */}
            <section className="lg:col-span-2 space-y-4">
              {items.map((it) => {
                const price = it.priceSnapshot ?? 0;
                const qty = it.qty ?? 1;
                const title = it.product?.title ?? "Product";
                const category = it.product?.category ?? "";
                const image = it.product?.image;

                return (
                  <div key={it._id} className="card p-4 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl bg-surface border border-border overflow-hidden">
                      {image ? (
                        <img src={image} alt={title} className="w-full h-full object-cover" />
                      ) : null}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm text-subtext">{category}</div>
                          <div className="font-medium text-white">{title}</div>
                          <div className="text-subtext text-sm">LKR {price}</div>
                        </div>
                        <button className="btn btn-ghost" onClick={() => removeItem(it._id)}>
                          Remove
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                        {/* Qty stepper */}
                        <div className="flex items-center rounded-xl border border-border bg-surface">
                          <button
                            className="px-3 py-2 hover:bg-[#111827] rounded-l-xl"
                            onClick={() => updateQty(it._id, qty - 1)}
                          >
                            –
                          </button>
                          <input
                            type="number"
                            min={1}
                            className="w-16 bg-transparent text-center outline-none py-2"
                            value={qty}
                            onChange={(e) =>
                              updateQty(it._id, Math.max(1, Number(e.target.value) || 1))
                            }
                          />
                          <button
                            className="px-3 py-2 hover:bg-[#111827] rounded-r-xl"
                            onClick={() => updateQty(it._id, qty + 1)}
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right ml-auto">
                          <div className="text-subtext text-sm">Subtotal</div>
                          <div className="text-base font-semibold">LKR {price * qty}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Summary */}
            <aside className="card p-6 h-fit lg:sticky lg:top-6">
              <h4 className="font-heading text-lg mb-4 text-white">Order Summary</h4>

              <div className="flex items-center justify-between py-2 border-b border-border/70">
                <span className="text-subtext">Items</span>
                <span>{items.reduce((s, i) => s + (i.qty ?? 0), 0)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-subtext">Total</span>
                <span className="text-xl font-semibold">LKR {cart.total}</span>
              </div>

              <button
                className="btn btn-primary w-full mt-2"
                onClick={checkout}
                disabled={items.length === 0}
              >
                Checkout
              </button>
              <button
                className="btn btn-ghost w-full mt-2"
                onClick={clear}
                disabled={items.length === 0}
              >
                Clear
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
