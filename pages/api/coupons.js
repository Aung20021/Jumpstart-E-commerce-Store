import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import Coupon from "@/models/coupon.model.js";

// GET: Fetch user's coupon
export const getCoupon = async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const coupon = await Coupon.findOne({
      userId: session.user.id, // Ensure this matches how you store user IDs
      isActive: true,
    });

    return res.status(200).json(coupon || null);
  } catch (error) {
    console.error("Error in getCoupon controller:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// POST: Validate a coupon code
export const validateCoupon = async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: session.user.id,
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: "Coupon expired" });
    }

    return res.status(200).json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.error("Error in validateCoupon controller:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// API route handler
export default async function handler(req, res) {
  if (req.method === "GET") {
    return getCoupon(req, res);
  } else if (req.method === "POST") {
    return validateCoupon(req, res);
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
