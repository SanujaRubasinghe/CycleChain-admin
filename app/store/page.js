"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminStorePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const res = await fetch("/api/products", {
        cache: "no-store",
        credentials: "include",
      });

      if (res.status === 401) {
        router.push("/login?callbackUrl=/store");
        return;
      }

      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await res.text();
        throw new Error(
          `Unexpected response (status ${res.status}). ${text?.slice(0, 120)}`
        );
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      await load();
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const r = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) {
        let msg = "";
        try {
          msg = (await r.json()).message;
        } catch {
          msg = await r.text();
        }
        throw new Error(msg || "Delete failed");
      }
      // Refresh list locally without a full reload
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface px-4 py-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">Store (Admin)</h1>
          <a href="/store/new" className="btn btn-primary">
            Add Item
          </a>
        </div>

        {loading && <div className="card p-4">Loading…</div>}
        {err && <div className="card p-4 text-red-400">{err}</div>}

        {!loading && !err && products.length === 0 && (
          <div className="card p-6 flex items-center justify-between">
            <span>No items yet. Create your first product.</span>
            <a href="/store/new" className="btn btn-primary">
              Add Item
            </a>
          </div>
        )}

        {!loading && !err && products.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p._id} className="card p-4 flex flex-col">
                <div className="h-36 rounded-xl bg-surface border border-border overflow-hidden mb-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-subtext">
                      No image
                    </div>
                  )}
                </div>
                <div className="text-sm text-subtext">{p.category}</div>
                <div className="text-white font-medium line-clamp-2">
                  {p.title}
                </div>
                <div className="mt-1">LKR {p.price}</div>

                <div className="flex gap-2 mt-4">
                  <a href={`/store/${p._id}/edit`} className="btn btn-ghost">
                    Edit
                  </a>
                  <button
                    className="btn btn-ghost"
                    onClick={() => remove(p._id, p.title)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
