"use client";

import { useEffect, useState } from "react";

const label = (c) =>
  ({
    helmets: "Helmets",
    locks: "Bike Locks",
    bottles: "Water Bottles",
    "seat-covers": "Seat Covers",
    gloves: "Gloves",
    "ebike-cables": "E-Bike Cables",
    chargers: "Chargers",
    backpacks: "Backpacks",
  }[c] || c);

export default function StorePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const seed = async () => {
    try {
      const r = await fetch("/api/products", { method: "POST" });
      const j = await r.json();
      alert(j.seeded ? "Seeded products" : j.reason || "Already seeded");
      load();
    } catch {
      alert("Seeding failed");
    }
  };

  const add = async (id) => {
    try {
      const res = await fetch("/api/store-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId: id, qty: 1 }),
      });
      if (res.status === 401) {
        window.location.href = "/login?callbackUrl=/store";
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || "Failed to add");
      }
      alert("Added to cart");
    } catch (e) {
      alert(e.message || "Failed to add");
    }
  };

  return (
    // Full-screen gradient background to match your theme
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold text-white">Cycle Store</h1>
          <a
            href="/cart"
            className="btn btn-primary"
            title="Go to cart"
          >
            Cart
          </a>
        </div>

        {loading && <div className="card p-4">Loading…</div>}
        {err && <div className="card p-4 text-red-400">{err}</div>}

        {!loading && !err && products.length === 0 && (
          <div className="card p-4 flex items-center justify-between">
            <div>No products found.</div>
            <button className="btn btn-primary" onClick={seed}>
              Seed demo products
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => (
            <div key={p._id} className="card p-4 flex flex-col">
              {/* Image (if available) */}
              <div className="h-36 rounded-xl bg-surface border border-border mb-3 overflow-hidden">
                {p.image ? (
                  // using <img> keeps it simple; you can swap for next/image if preferred
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                ) : null}
              </div>

              <div className="text-sm text-subtext">{label(p.category)}</div>
              <div className="text-lg font-medium text-white">{p.title}</div>
              <div className="mt-1">LKR {p.price}</div>

              <button
                className="btn btn-primary mt-4"
                onClick={() => add(p._id)}
                disabled={!p.inStock}
              >
                {p.inStock ? "Add to Cart" : "Out of stock"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
