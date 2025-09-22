import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectToDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

const notAuth = () => new Response(
  JSON.stringify({ items: [], total: 0, message: "Not authenticated" }),
  { status: 401, headers: { "content-type": "application/json" } }
);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notAuth();

  await connectToDB();
  let cart = await Cart.findOne({ user: session.user.id }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: session.user.id, items: [] });

  const total = cart.items.reduce((s, it) => s + it.priceSnapshot * it.qty, 0);
  return Response.json({ items: cart.items, total });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notAuth();

  const { productId, qty } = await req.json();
  if (!productId || !qty || qty < 1)
    return new Response(JSON.stringify({ message: "productId and qty required" }), { status: 400 });

  await connectToDB();
  const product = await Product.findById(productId);
  if (!product || !product.inStock)
    return new Response(JSON.stringify({ message: "Product unavailable" }), { status: 404 });

  let cart = await Cart.findOne({ user: session.user.id });
  if (!cart) cart = await Cart.create({ user: session.user.id, items: [] });

  const existing = cart.items.find(i => i.product?.toString() === productId);
  if (existing) existing.qty += Number(qty);
  else cart.items.push({ product: product._id, qty: Number(qty), priceSnapshot: product.price });

  await cart.save();
  await cart.populate("items.product");
  const total = cart.items.reduce((s, it) => s + it.priceSnapshot * it.qty, 0);
  return Response.json({ items: cart.items, total }, { status: 201 });
}
