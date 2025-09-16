// simulator.js
import mongoose from "mongoose";
import { Pickup, Dropoff, BatteryStatus, DemandRequest } from "./m-seed.js";

const MONGODB_URI='mongodb+srv://devuser:devuser_1234@cycle-chain-cluster.lj61csb.mongodb.net/?retryWrites=true&w=majority&appName=cycle-chain-cluster'

async function connectDB() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB (Simulator)");
}

// Utility: random location around Colombo
function randomLocation() {
  return {
    lat: 6.9271 + (Math.random() - 0.5) * 0.02, // ~1km spread
    lng: 79.8612 + (Math.random() - 0.5) * 0.02,
  };
}

// Utility: random int
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateData() {
  const now = new Date();

  // 1. Random pickup
  const pickup = new Pickup({
    ...randomLocation(),
    timestamp: now,
  });
  await pickup.save();

  // 2. Random dropoff
  const dropoff = new Dropoff({
    ...randomLocation(),
    timestamp: now,
  });
  await dropoff.save();

  // 3. Random battery update
  const battery = new BatteryStatus({
    bikeId: `bike-${randInt(1, 50)}`,
    ...randomLocation(),
    soc: randInt(10, 100), // SoC 10%–100%
    timestamp: now,
  });
  await battery.save();

  // 4. Random demand request
  const demand = new DemandRequest({
    ...randomLocation(),
    bikesAvailable: randInt(0, 10),
    requests: randInt(0, 20),
    timestamp: now,
  });
  await demand.save();

  console.log(`📡 Inserted new events @ ${now.toISOString()}`);
}

async function startSimulator() {
  await connectDB();

  // Generate data every 5 seconds
  setInterval(generateData, 5000);
}

startSimulator().catch((err) => {
  console.error("❌ Simulator error:", err);
  process.exit(1);
});
