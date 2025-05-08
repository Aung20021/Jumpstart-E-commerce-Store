import mongoose from "mongoose";

export async function mongooseConnect() {
  if (mongoose.connection.readyState === 1) {
    // Return the current connection if already connected
    return mongoose.connection.asPromise();
  } else {
    try {
      const uri = process.env.MONGODB_URI;

      // Ensure the connection string is not empty
      if (!uri) {
        throw new Error("MongoDB URI is not defined in environment variables.");
      }

      // Try connecting with improved options
      return await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000, // 30 seconds timeout for selecting a server
        socketTimeoutMS: 45000, // 45 seconds socket timeout for reading/writing
      });
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw new Error("MongoDB connection failed.");
    }
  }
}
