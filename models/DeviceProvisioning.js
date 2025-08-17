import mongoose from "mongoose";

const deviceProvisioningSchema = new mongoose.Schema({
    deviceId: {type: String, required: true, unique: true},
    firmwareVersion: {type: String},
    reportedAt: {type: Date, default: Date.now},
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    tempData: {type: mongoose.Schema.Types.Mixed},
})

export default mongoose.models.DeviceProvisioning || mongoose.model("DeviceProvisioning", deviceProvisioningSchema)