import dbConnect from '@/lib/mongodb';
import Bike from '@/models/Bike';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { getMqttClient } from '@/lib/mqttClient';

export const dynamic = 'force-dynamic';

export async function GET() {
  await dbConnect();
  try {
    const bikes = await Bike.find({});

    return new Response(JSON.stringify(bikes), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const { name, type, lat, lng, isLocked } = await request.json();
    const bikeId = uuidv4();
    const qrData = `http://192.168.1.2:3000/api/bikes/reserve?bikeId=${bikeId}&name=${name}`;
    const qrCode = await QRCode.toDataURL(qrData);
    const client = getMqttClient()

    const newBike = new Bike({
      bikeId,
      name,
      type,
      currentLocation: { lat, lng },
      qrCode,
      isLocked,
      status: 'available'
    });

    await newBike.save();

    client.publish(`bike/${name}/register`, "true", (err) => {
      if (err) console.error("Publish error:", err);
      else console.log(`Published "${message}" to topic "${topic}"`);
    })
    
    return new Response(JSON.stringify(newBike), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}