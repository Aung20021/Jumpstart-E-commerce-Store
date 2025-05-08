import { MongoClient, ServerApiVersion } from "mongodb";

// Ensure MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Timeout settings to prevent connection hanging
  connectTimeoutMS: 30000, // Timeout for establishing a connection
  socketTimeoutMS: 45000, // Timeout for socket activity (reading/writing)
};

let client;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to keep the connection persistent across hot reloads
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri, options);
    try {
      await global._mongoClient.connect();
      console.log("MongoDB connected in development mode.");
    } catch (error) {
      console.error("MongoDB connection error in development:", error);
      throw new Error("Failed to connect to MongoDB in development.");
    }
  }
  client = global._mongoClient;
} else {
  // In production, create a new MongoClient and connect once
  client = new MongoClient(uri, options);
  try {
    await client.connect();
    console.log("MongoDB connected in production mode.");
  } catch (error) {
    console.error("MongoDB connection error in production:", error);
    throw new Error("Failed to connect to MongoDB in production.");
  }
}

export default client;
