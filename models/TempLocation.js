import mongoose from "mongoose";

const tempLocationSchema = new mongoose.Schema({
    session_id: {type: String, requried: true},
    bike_id: {type: String, required: true},
    timestamp: {type: Date, default: Date.now, index: {expires: 3600}},
    location: {lat: Number, lng: Number},
    battery: Number
})

export default mongoose.models.TempLocation || mongoose.model("TempLocation", tempLocationSchema)