import mongoose from "mongoose";
import RentalSession from "./models/RentalSession.js";
import User from "./models/User.js";
import Payment from "./models/Payment.js";
import MaintenanceRecord from "./models/MaintenanceRecord.js";

const MONGO_URI = 'mongodb+srv://devuser:devuser_1234@cycle-chain-cluster.lj61csb.mongodb.net/?retryWrites=true&w=majority&appName=cycle-chain-cluster'

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear old data
    await Promise.all([
      User.deleteMany({}),
      RentalSession.deleteMany({}),
      Payment.deleteMany({}),
      MaintenanceRecord.deleteMany({}),
    ]);
    console.log("🗑️  Cleared old collections");

    // --- Users ---
    const users = [];
    for (let i = 1; i <= 10; i++) {
      users.push({
        _id: `user${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        username: `user${i}`,
        lastSeenAt: new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7
        ), // last week
        metadata: { vip: Math.random() > 0.7 },
      });
    }
    await User.insertMany(users);
    console.log(`✅ Inserted ${users.length} users`);

    // --- Bikes ---
    const bikes = Array.from({ length: 10 }, (_, i) => `bike${i + 1}`);

    // --- Rental Sessions ---
    const sessions = [];
    const now = new Date();
    for (let i = 1; i <= 50; i++) {
      const start = new Date(now);
      start.setDate(now.getDate() - Math.floor(Math.random() * 30));
      start.setHours(
        Math.floor(Math.random() * 24),
        Math.floor(Math.random() * 60)
      );

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + 15 + Math.floor(Math.random() * 45));

      sessions.push({
        session_id: `sess${i}`,
        user_id: users[Math.floor(Math.random() * users.length)]._id,
        bike_id: bikes[Math.floor(Math.random() * bikes.length)],
        start_time: start,
        end_time: end,
        start_location: {
          lat: 6.9271 + (Math.random() - 0.5) * 0.05,
          lng: 79.8612 + (Math.random() - 0.5) * 0.05,
        },
        end_location: {
          lat: 6.9271 + (Math.random() - 0.5) * 0.05,
          lng: 79.8612 + (Math.random() - 0.5) * 0.05,
        },
        distance: parseFloat((2 + Math.random() * 8).toFixed(2)),
        cost: parseFloat((50 + Math.random() * 200).toFixed(2)),
        geofence_violation:
          Math.random() > 0.8 ? [new Date(start.getTime() + 5 * 60000)] : [],
        status: ["reserved", "in_progress", "completed", "cancelled"][
          Math.floor(Math.random() * 4)
        ],
      });
    }
    await RentalSession.insertMany(sessions);
    console.log(`✅ Inserted ${sessions.length} rental sessions`);

    // --- Payments ---
    const payments = sessions.map((sess, idx) => ({
      _id: `pay${idx + 1}`,
      user_id: sess.user_id,
      session_id: sess.session_id,
      amount: sess.cost,
      currency: "USD",
      status: ["pending", "paid", "failed", "refunded"][
        Math.floor(Math.random() * 4)
      ],
      provider: ["Stripe", "PayPal", "Square"][Math.floor(Math.random() * 3)],
      createdAt: sess.end_time || sess.start_time,
    }));
    await Payment.insertMany(payments);
    console.log(`✅ Inserted ${payments.length} payments`);

    // --- Maintenance Records ---
    const maintenance = [];
    for (let i = 0; i < 15; i++) {
      const bike_id = bikes[Math.floor(Math.random() * bikes.length)];
      const reported_at = new Date(now);
      reported_at.setDate(now.getDate() - Math.floor(Math.random() * 30));

      maintenance.push({
        bike_id,
        reported_at,
        completed_at:
          Math.random() > 0.5
            ? new Date(reported_at.getTime() + 1 * 3600000)
            : null,
        issue: ["Flat tire", "Broken chain", "Battery issue", "Brake problem"][
          Math.floor(Math.random() * 4)
        ],
        notes: "Checked by mechanic",
        cost: parseFloat((10 + Math.random() * 90).toFixed(2)),
        status: ["open", "in_progress", "completed"][
          Math.floor(Math.random() * 3)
        ],
      });
    }
    await MaintenanceRecord.insertMany(maintenance);
    console.log(`✅ Inserted ${maintenance.length} maintenance records`);

    console.log("🎉 Database seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seed();
