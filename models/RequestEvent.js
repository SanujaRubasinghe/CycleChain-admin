import mongoose from "mongoose";
const { Schema } = mongoose;

const RequestEventSchema = new Schema(
  {
    userId: { type: String, index: true },
    type: { type: String, enum: ["ride_request", "search_nearby", "unlock_attempt"], default: "ride_request", index: true },
    location: {
      lat: { type: Number, required: true, index: true },
      lng: { type: Number, required: true, index: true },
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

RequestEventSchema.index({ "location.lat": 1, "location.lng": 1, createdAt: 1 });

export default mongoose.models.RequestEvent || mongoose.model("RequestEvent", RequestEventSchema);
