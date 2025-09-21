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
        let msg = "";
        try { msg = (await res.json()).message; } catch { msg = await res.text(); }
        throw new Error(msg || "Failed to save");
      }

      alert("Saved successfully!");
      window.location.href = "/store-management";
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start"
    >
      {/* Left column: image */}
      <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
        <div className="w-full h-64 bg-gray-800 border border-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <span className="text-gray-500">No image selected</span>
          )}
        </div>
        <label className="block text-sm font-medium text-gray-200">Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 transition"
        />
      </div>

      {/* Right column: form fields */}
      <div className="w-full md:w-2/3 flex flex-col gap-4">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-200">Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter product title"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-200">Category</label>
            <select
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
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
            <label className="block mb-1 text-sm font-medium text-gray-200">Price (LKR)</label>
            <input
              type="number"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="w-4 h-4 accent-green-500 rounded focus:ring-2 focus:ring-green-500"
          />
          <label className="text-gray-200 font-medium text-sm">In Stock</label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition mt-4"
        >
          {saving ? "Saving…" : initial?._id ? "Save Changes" : "Save Item"}
        </button>
      </div>
    </form>
  );
}
