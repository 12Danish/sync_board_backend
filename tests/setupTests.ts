import mongoose from "mongoose";
import app from "../server";
import connectDB from "../config/dbConnection";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerSocketHandlers } from "../sockets";

export let io: Server;
export let httpServer: any;
beforeAll(async () => {
  await connectDB();

  httpServer = createServer(app);

  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  registerSocketHandlers(io);

  await new Promise<void>((resolve) => httpServer.listen(() => resolve()));
});

afterAll(async () => {
  // Drop the test database and close the connection after all tests are done
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();

  io?.close();
  httpServer?.close();
});
