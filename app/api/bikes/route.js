import dbConnect from '@/lib/mongodb';
import Bike from '../../../models/Bike';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

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
    const { name, type, lat, lng } = await request.json();
    const bikeId = uuidv4();
    const qrData = JSON.stringify({ bikeId, name });
    const qrCode = await QRCode.toDataURL(qrData);

    const newBike = new Bike({
      bikeId,
      name,
      type,
      currentLocation: { lat, lng },
      qrCode,
      status: 'available'
    });

    await newBike.save();
    return new Response(JSON.stringify(newBike), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}