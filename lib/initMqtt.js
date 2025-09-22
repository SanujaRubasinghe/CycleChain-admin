import { getMqttClient } from "./mqttClient";
import Bike from "@/models/Bike";
import dbConnect from "./mongodb";

let client;
const OFFLINE_TIMEOUT = 5 * 1000; 
const CHECK_INTERVAL = 5000; 

if (!global.announcedBikes) global.announcedBikes = {};
if (!global.emergencyAlerts) global.emergencyAlerts = []

export function initMqttStatusServer() {
  if (client) return client;

  client = getMqttClient({
    topics: ["bike/+/telemetry", 'bike/announce', 'bike/+/emergency'],
    onMessage: async (topic, message) => {
      if (topic === "bike/announce") {
        try {
          const payload = JSON.parse(message.toString());
          const { bikeId, type, battery, gps, isLocked } = payload;

          global.announcedBikes[bikeId] = {
            bikeId,
            type,
            battery,
            gps,
            isLocked,
            lastSeenAt: Date.now(),
          };
        } catch (err) {
          console.error("Failed to parse MQTT message:", err);
        }
      } else if (topic.endsWith("/emergency")) {
          try {
            const payload = JSON.parse(message.toString())
            const {bikeId, type, gps} = payload

            global.emergencyAlerts[bikeId] = {
              bikeId, 
              type, 
              gps, 
              timestamp: Date.now(),
              dismissed: false
            }
            console.log(`Emergency reported from bike: ${bikeId}`)
          } catch (err) {
            console.error("Failed to parse MQTT message:", err);
          }
      } else {
        try {
          const bikeId = topic.split("/")[1];
          const payload = JSON.parse(message.toString());

          await dbConnect();

          await Bike.findOneAndUpdate(
            { name: bikeId },
            {
              $set: {
                "device.lastSeen": new Date(),
                lastSeenAt: new Date(),
                status: "available", 
                battery: payload.battery,
                isLocked: payload.isLocked,
                currentLocation: { lat: payload.gps.lat, lng: payload.gps.lng },
              },
            },
            { upsert: false, new: true }
          );
        } catch (err) {
          console.error("Error processing MQTT message: ", err);
        }
      }
    },
  });

  setInterval(async () => {
    try {
      await dbConnect();

      const now = new Date();
      const result = await Bike.updateMany(
        {
          $or: [
            { "device.lastSeen": { $lt: new Date(now - OFFLINE_TIMEOUT) } },
            { lastSeenAt: { $lt: new Date(now - OFFLINE_TIMEOUT) } },
          ],
          status: { $ne: "offline" }, 
        },
        { $set: { status: "offline" } }
      );

      if (result.modifiedCount > 0) {
        console.log(`Marked ${result.modifiedCount} bike(s) as offline at ${now}`);
      }
    } catch (err) {
      console.error("Error marking offline bikes: ", err);
    }
  }, CHECK_INTERVAL);

  return client;
}

