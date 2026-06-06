import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected MongoDB successfully: ", conn.connection.host);
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:   ", error);
    // 0 means success, 1 means failed
    process.exit(1);
  }
};
