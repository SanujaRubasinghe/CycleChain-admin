import mongoose from "mongoose";

const rentalSessionSchema = new mongoose.Schema({
    session_id: {type: String, unique: true, required: true},
    user_id: {type: String, required: true},
    bike_id: {type: String, required: true},
    start_time: Date, 
    end_time: Date, 
    start_location: {lat: Number, lng: Number},
    end_location: {lat: Number, lng: Number},
    distance: Number,
    cost: Number,
    geofence_violation: [Date],
    status: {
        type: String,
        enum: ["reserved", "in_progress", "completed"],
        default: "reserved"
    }
})

export default mongoose.models.RentalSession || mongoose.model("RentalSession", rentalSessionSchema)