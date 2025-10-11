"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Reusable ProductCard component
function ProductCard({ product, onDelete }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow hover:shadow-lg transition shadow-black/20 flex flex-col">
      <div className="h-44 bg-gray-700 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-sm text-gray-400">{product.category}</div>
        <div className="text-white font-semibold text-lg mt-1 line-clamp-2">{product.title}</div>
        <div className="text-green-400 font-medium mt-1">LKR {product.price}</div>
        <div className="mt-auto flex gap-2">
          <Link
            href={`/store/${product._id}/edit`}
            className="flex-1 py-2 text-center border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-700 transition"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(product._id, product.title)}
            className="flex-1 py-2 text-center border border-red-600 rounded-lg text-red-400 hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminStorePage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await fetch("/api/products", { cache: "no-store", credentials: "include" });

      if (res.status === 401) {
        router.push("/auth/login?callbackUrl=/store");
        return;
      }

      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id, title) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message || "Delete failed");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-8">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Store Inventory</h1>
          <Link
            href="/store/new"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition"
          >
            Add Item
          </Link>
        </div>

        {loading && <div className="text-gray-200 p-6 rounded-xl bg-gray-800">Loading products…</div>}
        {err && <div className="text-red-400 p-6 rounded-xl bg-gray-800">{err}</div>}

        {!loading && !err && products.length === 0 && (
          <div className="p-6 rounded-xl bg-gray-800 flex items-center justify-between">
            <span className="text-gray-300">No items yet. Create your first product.</span>
            <Link
              href="/store/new"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
            >
              Add Item
            </Link>
          </div>
        )}

        {!loading && !err && products.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onDelete={deleteProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}