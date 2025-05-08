import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/user.model";
import { createCheckoutSession } from "@/pages/api/payment";

// Optional: you can place the controller logic in this file too
// For now, we're keeping it clean by importing from a controller

export default async function handler(req, res) {
  await mongooseConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  req.user = user; // Attach user to request object for controller

  if (req.method === "POST") {
    return await createCheckoutSession(req, res); // Call your controller
  }

  res.setHeader("Allow", ["POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
