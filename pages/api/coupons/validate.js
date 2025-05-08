import { validateCoupon } from "@/pages/api/coupons"; // Assuming your controller is in src/api/coupons/index.js
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await mongooseConnect(); // Ensure DB connection
    await validateCoupon(req, res); // Call the controller
  } catch (error) {
    console.error("Error in /api/coupons/validate", error.message);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
