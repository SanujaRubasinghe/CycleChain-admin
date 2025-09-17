// models.js
import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  timestamp: { type: Date, default: Date.now },
});

const dropoffSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  timestamp: { type: Date, default: Date.now },
});

const batteryStatusSchema = new mongoose.Schema({
  bikeId: String,
  lat: Number,
  lng: Number,
  soc: Number, // state of charge %
  timestamp: { type: Date, default: Date.now },
});

const demandRequestSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  bikesAvailable: Number,
  requests: Number,
  timestamp: { type: Date, default: Date.now },
});

export const Pickup = mongoose.model("Pickup", pickupSchema);
export const Dropoff = mongoose.model("Dropoff", dropoffSchema);
export const BatteryStatus = mongoose.model("BatteryStatus", batteryStatusSchema);
export const DemandRequest = mongoose.model("DemandRequest", demandRequestSchema);
