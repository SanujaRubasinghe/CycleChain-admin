import mongoose from "mongoose";

const maintenanceRuleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  bike_type: { type: String, enum: ['city', 'mountain', 'electric'], required: true },
  trigger_type: { 
    type: String, 
    enum: ["mileage", "time", "combination"], 
    required: true 
  },
  mileage_interval: Number, 
  time_interval_days: Number, 
  maintenance_type: {
    type: String,
    enum: ["routine", "inspection", "battery", "tire", "brake"],
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  estimated_duration: Number, 
  parts_required: [String],
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.MaintenanceRule || mongoose.model("MaintenanceRule", maintenanceRuleSchema);