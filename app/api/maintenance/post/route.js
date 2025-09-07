import dbConnect from "@/lib/mongodb";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import Bike from "@/models/Bike";

export async function POST(req) {
  await dbConnect();
  try {
    const body = await req.json();

    const record = await MaintenanceRecord.create(body);

    const updatedBike = await Bike.findOneAndUpdate(
        { bikeId: body.bike_id },
        { $set: { status: "maintenance" } },
        { new: true, runValidators: true }
    );

    console.log("Updated bike:", updatedBike);

    return new Response(JSON.stringify({ message: "Created" }), { status: 201 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}
