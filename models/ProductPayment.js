import mongoose from "mongoose";

const ProductPaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      qty: { type: Number, required: true },
      priceSnapshot: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  method: { type: String, enum: ["card", "crypto", "qr"], required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  paymentIntentId: { type: String }, 
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ProductPayment || mongoose.model("ProductPayment", ProductPaymentSchema);
