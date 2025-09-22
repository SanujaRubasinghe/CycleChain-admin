"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "../../_components/ProductForm";
export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [product, setProduct] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch(`/api/products/${id}`, { cache: "no-store" });
        if (!r.ok) throw new Error("Failed to load product");
        setProduct(await r.json());
      } catch (e) {
        setErr(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const remove = async () => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    const r = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (r.ok) {
      alert("Deleted");
      router.push("/store");
    } else {
      const j = await r.json().catch(() => ({}));
      alert(j.message || "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Edit Item</h1>
              <p className="text-subtext">Update or remove this store item.</p>
            </div>
            <button className="btn btn-ghost" onClick={() => history.back()}>
              Back
            </button>
          </div>

          {loading && <div className="card p-6">Loading…</div>}
          {err && <div className="card p-6 text-red-400">{err}</div>}

          {product && (
            <div className="card p-6">
              <ProductForm initial={product} />
              <div className="mt-4 flex justify-between">
                <button className="btn btn-ghost" onClick={remove}>
                  Delete Item
                </button>
                <a href="/store" className="btn btn-ghost">
                  Cancel
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}