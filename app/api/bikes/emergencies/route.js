import { getMqttClient } from "@/lib/mqttClient";
import dbConnect from "@/lib/mongodb";
import Emergency from "@/models/Emergency";
import { NextResponse } from "next/server";

let emergencies = {}

function setupEmergencyListener() {
    const client = getMqttClient()
    client.subscribe("bike/emergency", (err) => {
        if (!err) console.log("Subscribed to bike/emergency topic")
    })

    client.on("message", async (topic, message) => {
        if (topic === "bike/emergency") {
            try {
                await dbConnect()

                const payload = JSON.parse(message.toString())
                console.log("Emergency alerted: ", payload)

                const emergency = new Emergency({
                    bikeId: payload.bikeId,
                    type: payload.type,
                    location: payload.gps,
                });

                await emergency.save()

                emergencies[payload.bikeId] = {
                    bikeId: payload.bikeId,
                    type: payload.type,
                    gps: payload.gps,
                    timestamp: Date.now()
                }
            } catch (error) {
                console.error("Failed to parse emergency message:", error)
            }
        }
    })
}

if (!global.emergencyListenerSetup) {
    setupEmergencyListener()
    global.emergencyListenerSetup = true
}

export async function GET() {
    await dbConnect()
    const emergencies = await Emergency.find().sort({ time: -1 }).limit(20);
    return NextResponse.json({ success: true, emergencies });
}