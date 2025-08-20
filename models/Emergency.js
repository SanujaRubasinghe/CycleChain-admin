import mongoose, { Schema, models } from "mongoose";

const EmergencySchema = new Schema(
  {
    bikeId: { type: String, required: true },
    type: { type: String, default: "emergency" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Emergency || mongoose.model("Emergency", EmergencySchema);
