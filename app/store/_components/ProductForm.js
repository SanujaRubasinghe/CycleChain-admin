"use client";

import { useState } from "react";

export default function ProductForm({ initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "helmets");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [inStock, setInStock] = useState(initial?.inStock ?? true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image || "");
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("category", category);
      fd.append("price", price);
      fd.append("inStock", inStock ? "true" : "false");
      if (file) fd.append("image", file);

      const url = initial?._id ? `/api/products/${initial._id}` : "/api/products";
      const method = initial?._id ? "PATCH" : "POST";

      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        // try read json then text
        let msg = "";
        try { msg = (await res.json()).message; } catch { msg = await res.text(); }
        throw new Error(msg || "Failed to save");
      }

      alert("Saved successfully!");
      window.location.href = "/store";
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* image */}
      <div className="w-full max-w-xs">
        <div className="w-full h-32 bg-surface border border-border rounded-xl flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-subtext">No image</span>
          )}
        </div>

        <label className="label mt-3">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-subtext file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white hover:file:bg-primary/80"
        />
      </div>

      <div>
        <label className="label">Title</label>
        <input
          type="text"
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Category</label>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="helmets">Helmets</option>
            <option value="locks">Locks</option>
            <option value="bottles">Bottles</option>
            <option value="seat-covers">Seat Covers</option>
            <option value="gloves">Gloves</option>
            <option value="ebike-cables">E-Bike Cables</option>
            <option value="chargers">Chargers</option>
            <option value="backpacks">Backpacks</option>
          </select>
        </div>
        <div>
          <label className="label">Price (LKR)</label>
          <input
            type="number"
            className="input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
        />
        <label className="label">In stock</label>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={saving}>
        {saving ? "Saving…" : initial?._id ? "Save Changes" : "Save Item"}
      </button>
    </form>
  );
}
