import mongoose from "mongoose";

const rentalSessionSchema = new mongoose.Schema({
  session_id: { type: String, unique: true, required: true },
  user_id: { type: String, required: true, index: true },
  bike_id: { type: String, required: true, index: true },
  start_time: { type: Date, required: true },
  end_time: { type: Date },
  start_location: {
    lat: Number,
    lng: Number
  },
  end_location: {
    lat: Number,
    lng: Number
  },
  distance: { type: Number }, 
  cost: { type: Number, default: 0 },
  geofence_violation: [{ type: Date }],
  status: {
    type: String,
    enum: ["reserved", "in_progress", "completed", "cancelled"],
    default: "reserved"
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

rentalSessionSchema.index({ start_time: 1 });
rentalSessionSchema.index({ end_time: 1 });
rentalSessionSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.RentalSession || mongoose.model("RentalSession", rentalSessionSchema);
