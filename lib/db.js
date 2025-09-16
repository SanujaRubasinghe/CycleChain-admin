import mongoose from "mongoose";
import dbConnect from "./mongodb";

let BikeModel
try {
    BikeModel = mongoose.models.Bike
} catch {}

export async function updateBikeLastSeen(bikeId) {
    await dbConnect()
    await BikeModel.findOneAndUpdate(
        {bikeId},
        {lastSeenAt: new Date()},
        {upsert: true, new: true}
    )
}

export async function getAllBikes() {
  await dbConnect();
  return BikeModel.find({});
}