import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/Cart";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });

  await connectToDB();
  let cart = await Cart.findOne({ user: session.user.id });
  if (!cart) cart = await Cart.create({ user: session.user.id, items: [] });
  cart.items = [];
  await cart.save();
  return Response.json({ items: [], total: 0 });
}
