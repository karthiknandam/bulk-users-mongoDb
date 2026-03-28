import mongoose from "mongoose";
import { config } from "dotenv";

config();

export const connectDb = async () => {
  try {
    // for dev purpose

    const uri = process.env.MONGO_URI || "mongodb://localhost:27017/users";
    console.log(uri);

    return await mongoose.connect(uri);
  } catch (error) {
    console.error("Cannot connect to DB");
    process.exit(1);
  }
};
