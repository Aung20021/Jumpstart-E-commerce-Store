import { deleteProduct, toggleFeaturedProduct } from "@/pages/api/product";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  switch (method) {
    case "DELETE":
      req.query.id = id; // Pass ID into the controller
      return deleteProduct(req, res);

    case "PATCH":
      req.query.id = id;
      return toggleFeaturedProduct(req, res);

    default:
      res.setHeader("Allow", ["DELETE", "PATCH"]);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}
