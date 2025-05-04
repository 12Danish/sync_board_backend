import jwt from "jsonwebtoken";
import { CustomError } from "../../utils/customError";
import { Socket } from "socket.io";
import { parse } from "cookie"; // Built-in Node.js cookie parser

export const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: CustomError) => void
) => {
  const cookieHeader = socket.handshake.headers.cookie;

  if (!cookieHeader) {
    return next(new CustomError("Authentication token must be provided", 401));
  }

  const cookies = parse(cookieHeader);
  const token = cookies.token;
  if (!token) {
    return next(
      new CustomError("Authentication token not found in cookies", 401)
    );
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "sync");
    (socket as any).user = user;
    next();
  } catch {
    next(new CustomError("Invalid token", 401));
  }
};
