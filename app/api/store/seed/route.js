import { connectToDB } from "@/lib/db";
import Product from "@/models/Product";

export async function POST() {
  await connectToDB();
  const count = await Product.countDocuments();
  if (count > 0) return Response.json({ seeded: false, message: "Already has products" });

  await Product.insertMany([
    { name: "StreetSafe Helmet", slug:"streetsafe-helmet", category:"Helmets", price: 9500, image:"/img/helmet1.jpg" },
    { name: "LockPro U-Lock", slug:"lockpro-u", category:"Bike Locks", price: 6000, image:"/img/lock1.jpg" },
    { name: "Hydra 750ml Bottle", slug:"hydra-750", category:"Water Bottles", price: 1800, image:"/img/bottle1.jpg" },
    { name: "Comfort Gel Seat", slug:"comfort-gel-seat", category:"Seat Covers", price: 5200, image:"/img/seat1.jpg" },
    { name: "GripX Gloves", slug:"gripx-gloves", category:"Gloves", price: 3200, image:"/img/gloves1.jpg" },
    { name: "E-Cable Type-A", slug:"ecable-a", category:"E-Bike Cables", price: 4100, image:"/img/cable1.jpg" },
    { name: "RapidCharge 48V", slug:"rapidcharge-48v", category:"Chargers", price: 17500, image:"/img/charger1.jpg" },
    { name: "TrailPack 20L", slug:"trailpack-20", category:"Backpacks", price: 13500, image:"/img/pack1.jpg" },
  ]);

  return Response.json({ seeded: true });
}
