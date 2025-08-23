import mongoose from "mongoose";

const telemetrySchema = new mongoose.Schema(
  {
    session_id: { type: String, required: true, index: true },
    bike_id: { type: String, required: true, index: true },
    gps: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    battery: { type: Number, required: true },
    locked: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

telemetrySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

export const Telemetry = mongoose.model("Telemetry", telemetrySchema);
