import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "@/lib/axios"; // Assuming axios is configured correctly

export const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,

  setProducts: (products) => set({ products }),

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post("/product", productData); // Updated API route
      set((state) => ({
        products: [...state.products, res.data],
        loading: false,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to create product");
      set({ loading: false, error: error.message });
    }
  },

  fetchAllProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/product"); // Updated API route
      set({ products: res.data.products, loading: false });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch products");
      set({ loading: false, error: error.message });
    }
  },

  fetchProductsByCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`/products/category/${category}`); // ✅ include await and store response
      set({ products: res.data.products, loading: false });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch category");
      set({ loading: false, error: error.message });
    }
  },
  deleteProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`/products/${productId}`); // Updated API route
      set((state) => ({
        products: state.products.filter((p) => p._id !== productId),
        loading: false,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to delete product");
      set({ loading: false, error: error.message });
    }
  },

  toggleFeaturedProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.patch(`/products/${productId}`); // Updated API route
      set((state) => ({
        products: state.products.map((product) =>
          product._id === productId
            ? { ...product, isFeatured: res.data.isFeatured }
            : product
        ),
        loading: false,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to toggle feature");
      set({ loading: false, error: error.message });
    }
  },

  fetchFeaturedProducts: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get("/products/featured"); // Updated API route
      set({ products: res.data.products || res.data, loading: false });
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to fetch featured");
      console.error("Error fetching featured products:", error);
      set({ loading: false, error: error.message });
    }
  },
}));
