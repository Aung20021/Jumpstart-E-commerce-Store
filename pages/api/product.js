import { redis } from "@/lib/redis";
import cloudinary from "@/lib/cloudinary";
import Product from "@/models/product.model";

// GET all products
export async function getAllProducts(req, res) {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getAllProducts", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET featured products (with Redis caching)
export async function getFeaturedProducts(req, res) {
  try {
    let featuredProducts = await redis.get("featured_products");

    if (featuredProducts) {
      return res.status(200).json(JSON.parse(featuredProducts));
    }

    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }

    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.status(200).json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// POST (create product)
export async function createProduct(req, res) {
  try {
    const { name, description, price, image, category } = req.body;

    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// DELETE product
export async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Deleted image from Cloudinary");
      } catch (error) {
        console.log("Error deleting image from Cloudinary", error);
      }
    }

    await Product.findByIdAndDelete(req.query.id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error in deleteProduct", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET recommended products (random sample)
export async function getRecommendedProducts(req, res) {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// GET products by category
export async function getProductsByCategory(req, res) {
  const { category } = req.query;

  try {
    const products = await Product.find({ category });
    res.status(200).json({ products });
  } catch (error) {
    console.log("Error in getProductsByCategory", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// PUT toggle featured product
export async function toggleFeaturedProduct(req, res) {
  try {
    const product = await Product.findById(req.query.id);

    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Update cache for featured products
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updateFeaturedProductsCache", error);
  }
}
export default async function handler(req, res) {
  if (req.method === "POST") {
    return createProduct(req, res);
  } else if (req.method === "GET") {
    return getAllProducts(req, res);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
