
import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentiatlly during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI; // Access process.env when function is called

    if (!MONGODB_URI) {
      console.error("Error: MONGODB_URI is not defined. Please ensure it's set in your .env.local file and that you've restarted your development server.");
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("MongoDB connected successfully.");
      return mongooseInstance;
    }).catch(err => {
      console.error("Initial MongoDB connection error:", err);
      cached.promise = null; // Reset promise on error
      throw err; // Re-throw error
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // The promise was already rejected and error handled in the catch block above,
    // or it's a new error if this await somehow fails differently.
    // cached.promise should be null if the initial connection failed.
    console.error("Failed to establish MongoDB connection from cached promise:", e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
