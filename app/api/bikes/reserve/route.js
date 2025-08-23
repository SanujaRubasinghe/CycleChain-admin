import dbConnect from "@/lib/mongodb";
import Bike from "@/models/Bike";
import { getMqttClient } from "@/lib/mqttClient";

export async function GET(request) {
    await dbConnect()
    const url = new URL(request.url);
    const bikeId = url.searchParams.get("bikeId");
    const name = url.searchParams.get("name");

    if (!bikeId || !name) {
        return new Response(JSON.stringify({ error: "Missing bikeId or name" }), { status: 400 });
    }

    try {
        const bike = await Bike.findOneAndUpdate(
            { bikeId: bikeId },
            {
                isLocked: false,
                status: "in_use"
            },
            { new: true }
        );
    
        const topic = `bike/${name}/command`
        const message = "unlock"

        const client = getMqttClient()
    
        client.publish(topic, message, {qos: 1}, (err) => {
            if (err) {
                return new Response(JSON.stringify({success: false, error: err.message}), {status: 500})
            }
            console.log("MQTT command sent:",topic,message)
        })
        return new Response(JSON.stringify(bike), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}