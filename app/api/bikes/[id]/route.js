import { connectDB } from '@/lib/db';
import Bike from '@/models/Bike';

export async function GET(request, { params }) {
  await connectDB();
  try {
    const bike = await Bike.findOne({ bikeId: params.id });
    if (!bike) {
      return new Response(JSON.stringify({ error: 'Bike not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(bike), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await connectDB();
  try {
    const { status, isLocked, lat, lng } = await request.json();
    const update = {};
    if (status) update.status = status;
    if (isLocked !== undefined) update.isLocked = isLocked;
    if (lat && lng) update.currentLocation = { lat, lng };

    const bike = await Bike.findOneAndUpdate(
      { bikeId: params.id },
      update,
      { new: true }
    );
    return new Response(JSON.stringify(bike), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}