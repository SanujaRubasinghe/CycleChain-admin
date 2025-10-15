// app/admin/store/new/page.jsx (or your current path)
import ProductForm from "../_components/ProductForm";

export const metadata = { title: "Add Store Item" };

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-6">
          <h1 className="text-3xl font-semibold text-white">Add Store Item</h1>
          <p className="text-subtext">Create a new item for the Cycle Store.</p>
        </div>

        {/* Centered, narrower form card */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-surface/60 border border-border rounded-2xl shadow-lg p-6 md:p-8">
            <ProductForm initial={null} />
          </div>
        </div>
      </div>
    </div>
  );
}