import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConnection";
import bodyParser from "body-parser";
import { errorHandlerMiddleware } from "./middleware/errorHandler";
import boardRoutes from "./routes/boardRoutes";
import userRoutes from "./routes/authRoutes/userRoutes";
import firebaseAuthRoutes from "./routes/authRoutes/firebaseAuthRoutes";
import commonAuthRoutes from "./routes/authRoutes/commonAuthRoutes";
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

const port: number = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(bodyParser.json());
app.use("/api", boardRoutes);
app.use("/api", userRoutes);
app.use("/api", firebaseAuthRoutes);
app.use("/api", commonAuthRoutes);
app.use(errorHandlerMiddleware);
app.listen(port, () => {
  console.log(`YAYY Server running on port ${port}`);
});
