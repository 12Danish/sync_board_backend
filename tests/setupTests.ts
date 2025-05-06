import mongoose from "mongoose";
import connectDB from "../config/dbConnection";

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  // Drop the test database and close the connection after all tests are done
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});
