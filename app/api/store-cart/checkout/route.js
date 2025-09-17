import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/Cart";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });

  await connectToDB();
  const cart = await Cart.findOne({ user: session.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) return new Response(JSON.stringify({ message: "Cart is empty" }), { status: 400 });

  const total = cart.items.reduce((s, it) => s + it.priceSnapshot * it.qty, 0);

  // Handoff payload (plug into blockchain later)
  return Response.json({
    orderId: cart._id.toString(),
    userId: session.user.id,
    currency: "LKR",
    total,
    items: cart.items.map(i => ({
      productId: i.product._id.toString(),
      title: i.product.title,
      qty: i.qty,
      price: i.priceSnapshot,
    })),
  });
}
