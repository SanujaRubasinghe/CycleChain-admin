"use client";

import { useState } from "react";

export default function AdminNewProductPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Helmets");
  const [price, setPrice] = useState("");
  const [inStock, setInStock] = useState(true);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("category", category);
      formData.append("price", price);
      formData.append("inStock", inStock);
      if (image) formData.append("image", image);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.message || "Failed to save item");
      }

      setOk("Item saved successfully!");
      setTitle("");
      setSlug("");
      setCategory("Helmets");
      setPrice("");
      setInStock(true);
      setImage(null);
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-surface px-4">
      <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold mb-6 text-white">Add Store Item</h1>

        {err && (
          <div className="p-3 rounded border border-red-500/40 text-red-400 mb-4">
            {err}
          </div>
        )}
        {ok && (
          <div className="p-3 rounded border border-green-500/40 text-green-400 mb-4">
            {ok}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              placeholder="e.g. Aero Helmet"
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Slug</label>
              <input
                type="text"
                placeholder="aero-helmet"
                className="input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Helmets</option>
                <option>Bike Locks</option>
                <option>Water Bottles</option>
                <option>Seat Covers</option>
                <option>Gloves</option>
                <option>E-bike Cables</option>
                <option>Chargers</option>
                <option>Backpacks</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div>
              <label className="label">Price (LKR)</label>
              <input
                type="number"
                placeholder="12000"
                className="input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              <label className="text-sm text-white">In stock</label>
            </div>
          </div>

          <div>
            <label className="label">Image</label>
            <input
              type="file"
              accept="image/*"
              className="input bg-transparent p-0"
              onChange={(e) => setImage(e.target.files[0])}
            />
            <p className="text-xs text-subtext mt-1">
              Tip: On phone, this opens the camera/gallery.
            </p>
            {image && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="mt-3 h-32 rounded-md object-cover border border-border"
              />
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save Item"}
            </button>
            <a href="/store" className="btn btn-ghost">
              View Store
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
