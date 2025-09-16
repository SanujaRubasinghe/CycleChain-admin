import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  _id: { type: String }, // payment id
  user_id: { type: String, required: true },
  session_id: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: { type: String, enum: ["pending","paid","failed","refunded"], default: "pending" },
  provider: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
