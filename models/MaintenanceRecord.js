import mongoose from "mongoose";

const maintenanceSchema = new mongoose.Schema({
  // bike_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Bike', required: true, index: true },
  bikeId: { type: String, required: true },
  reported_at: { type: Date, default: Date.now },
  scheduled_at: { type: Date, required: true },
  completed_at: Date,
  issue: String,
  notes: String,
  cost: Number,
  status: { 
    type: String, 
    enum: ["scheduled", "in_progress", "completed", "cancelled"], 
    default: "scheduled" 
  },
  type: {
    type: String,
    enum: ["routine", "repair", "inspection", "battery", "tire", "brake"],
    required: true
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium"
  },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
  mileage_at_service: Number,
  parts_used: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  duration_minutes: Number
}, { timestamps: true });

export default mongoose.models.MaintenanceRecord || mongoose.model("MaintenanceRecord", maintenanceSchema);