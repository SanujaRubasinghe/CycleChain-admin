import { getMqttClient } from "@/lib/mqttClient";
import dbConnect from "@/lib/mongodb";
import Emergency from "@/models/Emergency";

let io; 
export function setSocketIO(serverIO) {
  io = serverIO;
}

export function setupEmergencyListener() {
  const client = getMqttClient();
  client.subscribe("bike/emergency", (err) => {
    if (!err) console.log("Subscribed to bike/emergency topic");
  });

  client.on("message", async (topic, message) => {
    if (topic === "bike/emergency") {
      try {
        await dbConnect();
        const payload = JSON.parse(message.toString());
        console.log("🚨 Emergency:", payload);

        const emergency = new Emergency({
          bikeId: payload.bikeId,
          type: payload.type,
          location: payload.gps,
        });
        await emergency.save();

        // Emit event to all connected clients
        if (io) {
          io.emit("emergency", {
            bikeId: payload.bikeId,
            type: payload.type,
            location: payload.gps,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        console.error("Failed to handle emergency:", err);
      }
    }
  });
}

// Only setup once
if (!global.emergencyListenerSetup) {
  setupEmergencyListener();
  global.emergencyListenerSetup = true;
}
