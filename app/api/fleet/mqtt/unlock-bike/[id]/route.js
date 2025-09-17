import { getMqttClient } from "@/lib/mqttClient";

export default async function PUT(request, {params}) {
    const {id} = await params
    const client = getMqttClient()

    try {
        client.publish(`bike/${id}/command`, "unlock", {qos: 1}, (err) => {
            if (err) {
                return new Response(JSON.stringify({success: false, error: err.message}), {status: 500})
            }
            console.log("MQTT command to unlock sent")
            return new Response(
                JSON.stringify({success: true, message: `Command 'unlock' sent to bike: ${id}`}),
                {status: 200}
            )
        })
    } catch (error) {
        console.error("MQTT error: ", error)
    }
}