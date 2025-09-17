import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastSeenAt: { type: Date },
  metadata: { type: mongoose.Schema.Types.Mixed },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
