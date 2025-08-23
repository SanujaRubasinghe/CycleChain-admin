import mongoose from "mongoose";
import Ride from "./models/Ride.js";

// MongoDB connection
const MONGODB_URI='mongodb+srv://devuser:devuser_1234@cycle-chain-cluster.lj61csb.mongodb.net/?retryWrites=true&w=majority&appName=cycle-chain-cluster'


async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }
}

// Helper to generate random coordinates around a center (e.g., Colombo)
function randomPoint(centerLat, centerLng, radiusKm = 5) {
  const r = radiusKm / 111; // ~1 deg ≈ 111 km
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  return {
    lat: centerLat + x,
    lng: centerLng + y,
  };
}

// Generate a single ride
function generateRide(bikeId = null) {
  const start = randomPoint(6.9271, 79.8612); // Colombo center
  const end = randomPoint(6.9271, 79.8612);
  const startTime = new Date(Date.now() - Math.floor(Math.random() * 3600 * 1000)); // within last hour
  const endTime = new Date(startTime.getTime() + Math.floor(Math.random() * 3600 * 1000)); // up to 1 hr later
  return {
    bikeId: bikeId || `bike-${Math.floor(Math.random() * 100)}`,
    start,
    end,
    startTime,
    endTime,
  };
}

// Seed multiple rides
async function seedRides(n = 10) {
  await connectDB();
  const rides = [];
  for (let i = 0; i < n; i++) {
    rides.push(generateRide());
  }
  await Ride.insertMany(rides);
  console.log(`${n} rides inserted`);
  mongoose.connection.close();
}

// Run
seedRides(20); // insert 20 simulated rides
