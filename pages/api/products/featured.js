// pages/api/products/featured.js

import { getFeaturedProducts } from "../product";

export default async function handler(req, res) {
  if (req.method === "GET") {
    // Call the controller for fetching featured products
    await getFeaturedProducts(req, res);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
