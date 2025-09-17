import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  category: {
    type: String,
    enum: ["helmets","locks","bottles","seat-covers","gloves","ebike-cables","chargers","backpacks"],
    required: true,
  },
  price: { type: Number, required: true },   // LKR
  image: { type: String },                    // optional
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
