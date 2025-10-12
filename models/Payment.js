// app/models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
  },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "LKR" }, 
  method: {
    type: String,
    enum: ["crypto", "card", "qr"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  transactionId: { type: String }, 
  qrCodeData: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
}, {
  timestamps: true,
  collection: "payments",
});

export default mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
