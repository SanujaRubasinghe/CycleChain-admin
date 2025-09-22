// app/models/Reservation.js
import mongoose from "mongoose";

const rentalSessionSchema = new mongoose.Schema({
    session_id: {
        type: String,
        unique: true
    },
    userId: {  // Changed from user_id to userId
        type: String,
        required: true
    },
    bikeId: {  // Changed from bike_id to bikeId
        type: String,
        required: true
    },
    start_time: {
        type: Date,
        required: true
    },
    end_time: {
        type: Date,
        required: true
    },
    start_location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    end_location: {
        lat: Number,
        lng: Number
    },
    unlock_code : {type: String},
    distance: {type: Number, default: 0}, 
    cost: Number,
    geofence_violation: [Date],
    status: {
        type: String,
        enum: ["reserved", "in_progress", "completed-payment-pending", "completed-paid", "active", "cancelled"], 
        default: "reserved"
    }
}, {
    timestamps: true,
    collection: 'reservations'
});

rentalSessionSchema.statics.isTimeMismatch = async function(start_time, end_time) {
    return new Date(start_time) <= new Date(end_time);
};

rentalSessionSchema.statics.isBikeAvailable = async function(bikeId, start_time, end_time) { 
    const overlappingReservations = await this.find({
        bikeId, 
        status: { $in: ['reserved', 'in_progress'] },
        $or: [
            { start_time: { $lt: end_time }, end_time: { $gt: start_time } },
            { start_time: { $gte: start_time, $lte: end_time } }
        ]
    });
    return overlappingReservations.length === 0;
};


rentalSessionSchema.pre('save', function(next) {
    if (!this.session_id) {
        this.session_id = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    next();
});

export default mongoose.models.Reservation || mongoose.model('Reservation', rentalSessionSchema);