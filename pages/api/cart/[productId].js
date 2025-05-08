import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import User from "@/models/user.model";
import { mongooseConnect } from "@/lib/mongoose";

// Controller to handle cart item quantity update
export const updateQuantity = async (req, res) => {
  const { productId } = req.query; // Extract productId from query
  const { quantity } = req.body; // Get the quantity from the request body

  try {
    const user = req.user;

    // Find the cart item for the given productId
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (!existingItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (quantity === 0) {
      // Remove the product from the cart if quantity is 0
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    } else {
      // Update the quantity of the existing item
      existingItem.quantity = quantity;
    }

    // Save the updated user document
    await user.save();
    res.json(user.cartItems); // Respond with the updated cart items
  } catch (error) {
    console.error("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Default export handler with session-based user setup
export default async function handler(req, res) {
  await mongooseConnect();

  // Get the session to check if the user is authenticated
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Find the user based on the session email
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  req.user = user; // Attach the user to the request object

  // Handle different HTTP methods (GET, POST, DELETE, PUT)
  switch (req.method) {
    case "PUT":
      await updateQuantity(req, res); // Call the update quantity function
      break;
    default:
      res.setHeader("Allow", ["PUT"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
