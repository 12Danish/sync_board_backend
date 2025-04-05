import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConnection";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

const port: number = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use("/api", require("./routes/boardRoutes"));

app.listen(port, () => {
  console.log(`YAYY Server running on port ${port}`);
});
