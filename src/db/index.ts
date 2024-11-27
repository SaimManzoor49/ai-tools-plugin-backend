import mongoose from "mongoose";
import { DB_NAME } from "../constants/index";

const connectToDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`\n MongoDB connected to Host: ${conn.connection.host}`);
  } catch (error) {
    console.log("\n MONGODB connection error ", error);
    process.exit(1);
  }
};

export default connectToDB;
