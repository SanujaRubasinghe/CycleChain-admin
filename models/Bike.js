import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  bikeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['city', 'mountain', 'electric'], required: true },
  status: { 
    type: String, 
    enum: ['available', 'in_use', 'maintenance', 'locked', "provisioning", "require_collection","offline"], 
    default: 'provisioning' 
  },
  mileage: { type: Number, min: 0, default: 0},
  mileage_at_last_maintenance: { type: Number, min: 0, default: 0},
  battery: { type: Number, min: 0, max: 100, default: 100 },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  qrCode: { type: String, required: true, unique: true },
  reserved_by: { type: String, default: null },
  lastMaintenance: { type: Date, default: Date.now },
  isLocked: { type: Boolean, default: true },
  lastMoveAt: { type: Date, index: true },
  lastSeenAt: { type: Date, index: true },
  createdAt: { type: Date, default: Date.now },
  device: {
    chipId: {type: String},
    firmwareVersion: {type: String},
    lastSeen: {type: Date, default: Date.now}
  }
},
{timestamps: true});
BikeSchema.index({currentLocation: "2dsphere"})

export default mongoose.models.Bike || mongoose.model("Bike", BikeSchema)