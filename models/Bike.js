import mongoose from "mongoose";

const BikeSchema = new mongoose.Schema({
  bikeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['city', 'mountain', 'electric'], required: true },
  status: { 
    type: String, 
    enum: ['available', 'in_use', 'maintenance', 'locked'], 
    default: 'available' 
  },
  battery: { type: Number, min: 0, max: 100, default: 100 },
  currentLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  qrCode: { type: String, required: true, unique: true },
  lastMaintenance: { type: Date, default: Date.now },
  isLocked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
BikeSchema.index({location: "2dsphere"})

export default mongoose.models.Bike || mongoose.model("Bike", BikeSchema)