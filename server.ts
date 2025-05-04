import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConnection";
import bodyParser from "body-parser";
import { errorHandlerMiddleware } from "./middleware/http/errorHandler";
import boardRoutes from "./routes/boardRoutes";
import userRoutes from "./routes/authRoutes/userRoutes";
import firebaseAuthRoutes from "./routes/authRoutes/firebaseAuthRoutes";
import commonAuthRoutes from "./routes/authRoutes/commonAuthRoutes";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import socketIo from "socket.io";
import { registerSocketHandlers } from "./sockets";
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app: Application = express();

// Setup HTTP server
const server = require("http").createServer(app); // Create HTTP server using express app

// Initialize Socket.IO with the server
const io = new socketIo.Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow all origins (you can restrict this in production)
    credentials: true,
  },
});

registerSocketHandlers(io);
const port: number = Number(process.env.PORT) || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", boardRoutes);
app.use("/api", userRoutes);
app.use("/api", firebaseAuthRoutes);
app.use("/api", commonAuthRoutes);
app.use(errorHandlerMiddleware);
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
