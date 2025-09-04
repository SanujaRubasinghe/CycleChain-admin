// Delete this model, it is replaced by RentalSesson schema

import mongoose from "mongoose";
const { Schema } = mongoose;

const PointSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const RideSchema = new Schema(
  {
    bikeId: { type: String, index: true },
    start: { type: PointSchema, required: true, index: true },
    end: { type: PointSchema, required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

RideSchema.index({ "start.lat": 1, "start.lng": 1, startTime: 1 });
RideSchema.index({ "end.lat": 1, "end.lng": 1, endTime: 1 });

export default mongoose.models.Ride || mongoose.model("Ride", RideSchema);
