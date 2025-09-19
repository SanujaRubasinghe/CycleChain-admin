import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/Cart";

const notAuth = () => new Response(JSON.stringify({ message: "Not authenticated" }), { status: 401 });

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notAuth();

  const { qty } = await req.json();
  if (!qty || qty < 1) return new Response(JSON.stringify({ message: "Valid qty required" }), { status: 400 });

  await connectToDB();
  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return new Response(JSON.stringify({ message: "Cart not found" }), { status: 404 });

  const item = cart.items.id(params.itemId);
  if (!item) return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });

  item.qty = qty;
  await cart.save();
  await cart.populate("items.product");

  const total = cart.items.reduce((s, it) => s + it.priceSnapshot * it.qty, 0);
  return Response.json({ items: cart.items, total });
}

export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notAuth();

  await connectToDB();
  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return new Response(JSON.stringify({ message: "Cart not found" }), { status: 404 });

  const item = cart.items.id(params.itemId);
  if (!item) return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });

  item.deleteOne();
  await cart.save();
  await cart.populate("items.product");

  const total = cart.items.reduce((s, it) => s + it.priceSnapshot * it.qty, 0);
  return Response.json({ items: cart.items, total });
}
