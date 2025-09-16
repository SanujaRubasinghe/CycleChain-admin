import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  specialization: { type: String, enum: ["mechanical", "electrical", "general"] },
  status: { 
    type: String, 
    enum: ["available", "busy", "on_leave"], 
    default: "available" 
  },
  active_tasks: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Technician || mongoose.model("Technician", technicianSchema);