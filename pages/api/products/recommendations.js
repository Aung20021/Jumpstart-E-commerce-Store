// pages/api/products/featured.js

import { getRecommendedProducts } from "../product";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Call the controller for fetching featured products
    await getRecommendedProducts(req, res);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
