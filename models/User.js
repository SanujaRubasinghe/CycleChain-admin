
// admin/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    nic: {
      type: String,
      required: false,
      trim: true,
      minlength: 5,
      maxlength: 20,
    },
    walletAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

// Avoid OverwriteModelError in dev
const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;

