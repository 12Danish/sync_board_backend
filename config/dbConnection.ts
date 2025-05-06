import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const dbUrl =
      process.env.NODE_ENV == "test"
        ? (process.env.CONNECTION_STRING as string)
        : (process.env.CONNECTION_STRING_TEST as string);
    const connect = await mongoose.connect(
      dbUrl
    );

    console.log(`MongoDB Connected: ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
