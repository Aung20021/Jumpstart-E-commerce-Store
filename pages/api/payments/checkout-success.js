import { checkoutSuccess } from "@/pages/api/payment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { mongooseConnect } from "@/lib/mongoose";
import User from "@/models/user.model"; // Required for session validation

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await mongooseConnect();

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    await checkoutSuccess(req, res);
  } catch (error) {
    console.error("Error in /api/payments/checkout-success:", error.message);
    res.status(500).json({
      message: "Server error in checkout-success handler",
      error: error.message,
    });
  }
}
