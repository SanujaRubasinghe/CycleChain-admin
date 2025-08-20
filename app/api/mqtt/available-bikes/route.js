import { NextResponse } from "next/server";
import { getMqttClient } from "@/lib/mqttClient";

// Use global to persist state across hot reloads / serverless invocations
if (!global.announcedBikes) global.announcedBikes = {};
if (!global.mqttListenerSetup) {
  const client = getMqttClient();
  client.subscribe("bikes/announce", (err) => {
    if (!err) console.log("Subscribed to bikes/announce topic");
  });

  client.on("message", (topic, message) => {
    if (topic === "bikes/announce") {
      try {
        const payload = JSON.parse(message.toString());
        const { bikeId, type, battery, gps, isLocked } = payload;
        console.log("MQTT announce received:", payload);

        global.announcedBikes[bikeId] = {
          bikeId,
          type,
          battery,
          gps,
          isLocked,
          lastSeen: Date.now(),
        };

        // Remove bikes that haven't announced in 60 seconds
        const now = Date.now();
        for (const id in global.announcedBikes) {
          if (now - global.announcedBikes[id].lastSeen > 60 * 1000) {
            delete global.announcedBikes[id];
          }
        }
      } catch (err) {
        console.error("Failed to parse MQTT message:", err);
      }
    }
  });

  global.mqttListenerSetup = true;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    bikes: Object.values(global.announcedBikes),
  });
}
