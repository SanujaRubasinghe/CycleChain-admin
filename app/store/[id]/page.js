import ProductForm from "../_components/ProductForm";

async function fetchProduct(id) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  const r = await fetch(`${base}/api/admin/products/${id}`, { cache: "no-store" });
  if (!r.ok) return null;
  return r.json();
}

export default async function EditProductPage({ params }) {
  const product = await fetchProduct(params.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-white">Edit Store Item</h1>
            <p className="text-subtext">Update details for this product.</p>
          </div>

          <div className="card p-6">
            {product ? <ProductForm initial={product} /> : <div>Item not found.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
