// app/models/Bike.js
import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
    bikeId: { type: String, required: false },
    name: { type: String, required: false },
    type: { type: String, required: false },
    status: { type: String, required: false },
    battery: { type: Number, required: false },
    currentLocation: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false }
    },
    qrCode: { type: String, required: false },
    reserved_by: { type: String, required: false },
    lastMaintenance: { type: Date, required: false },
    isLocked: { type: Boolean, required: false },
    lastMoveAt: { type: Date, required: false },
    lastSeenAt: { type: Date, required: false },
    createdAt: { type: Date, required: false },
    device: {
        chipId: { type: String, required: false },
        firmwareVersion: { type: String, required: false },
        lastSeen: { type: Date, required: false }
    }
}, {
    timestamps: true,
    strict: false // Allow additional fields not in schema
});

// Create index if needed
BikeSchema.index({ currentLocation: "2dsphere" });

// Explicitly specify the collection name as "Bike" in the "e-bike-rental" database
export default mongoose.models.Bike || mongoose.model("Bike", BikeSchema, "Bike");