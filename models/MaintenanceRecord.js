import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  bike_id: { type: String, required: true, index: true },
  reported_at: { type: Date, default: Date.now },
  completed_at: Date,
  issue: String,
  notes: String,
  cost: Number,
  status: { type: String, enum: ["open","in_progress","completed"], default: "open" }
});

export default mongoose.models.MaintenanceRecord || mongoose.model("MaintenanceRecord", maintenanceSchema);
