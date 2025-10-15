// scripts/seedPayments.mjs
import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductPayment from "../models/Payment.js"; // adjust path if needed

dotenv.config();

async function seedPayments() {
  try {
    // connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    // clear old data if you want
    await ProductPayment.deleteMany({});
    console.log("🗑️ Old payments cleared");

    // sample payments
    const payments = [
      {
        user: new mongoose.Types.ObjectId(),
        items: [
          { product: new mongoose.Types.ObjectId(), qty: 2, priceSnapshot: 25 },
          { product: new mongoose.Types.ObjectId(), qty: 1, priceSnapshot: 40 },
        ],
        total: 90,
        method: "card",
        status: "completed",
        paymentIntentId: "pi_test_123",
      },
      {
        user: new mongoose.Types.ObjectId(),
        items: [
          { product: new mongoose.Types.ObjectId(), qty: 1, priceSnapshot: 60 },
        ],
        total: 60,
        method: "crypto",
        status: "pending",
        paymentIntentId: "pi_test_456",
      },
      {
        user: new mongoose.Types.ObjectId(),
        items: [
          { product: new mongoose.Types.ObjectId(), qty: 3, priceSnapshot: 15 },
        ],
        total: 45,
        method: "qr",
        status: "failed",
        paymentIntentId: "pi_test_789",
      },
    ];

    await ProductPayment.insertMany(payments);
    console.log("✅ Payments seeded successfully");

    process.exit();
  } catch (err) {
    console.error("❌ Error seeding payments:", err);
    process.exit(1);
  }
}

seedPayments();
