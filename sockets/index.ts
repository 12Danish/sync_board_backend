import { Server, Socket } from "socket.io";
import { registerDrawingHandlers } from "./handlers/drawHandler";
import { registerTextHandlers } from "./handlers/textHandler";
import { socketAuthMiddleware } from "../middleware/socket/authHandler";
import { socketPermMiddleware } from "../middleware/socket/permHandler";
import { registerCursorHandler } from "./handlers/cursorHandler";
import { CustomError } from "../utils/customError";
/**
 * Registers the main socket event listeners for the application.
 *
 * This function sets up:
 * - Connection and disconnection events
 * - Board joining logic using rooms
 * - Delegation to specialized handlers for drawing and text events
 *
 * @param io - The Socket.IO server instance that listens for client connections.
 */
export const registerSocketHandlers = (io: Server) => {
  // Making sur ethat the user is authenticated
  io.use(socketAuthMiddleware);
  io.use(socketPermMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("A user connected with the socket id", socket.id);

    /**
     * Joins the socket to a room identified by the board ID.
     * Rooms are used to group sockets working on the same board so events are scoped correctly.
     *
     * @param boardId - The unique identifier of the board (can be a MongoDB ID).
     */
    const permission = (socket as any).permission;
    const userId = (socket as any).user.id;
    const userEmail = (socket as any).user.email;

    socket.on("joinBoard", (boardId: string) => {
      if (permission) {
        socket.join(boardId);
        console.log(
          `User with the socket id ${socket.id} joined the room for the board with id ${boardId}`
        );
      } else {
        socket.emit(
          "error",
          new CustomError("You do not have permission to draw.", 403)
        );
      }
    });

    // Registering handler for cursor movement. Cursor movements are tracked and broadcasted to users except the sender
    registerCursorHandler(io, socket, permission, userId, userEmail);
    // Register all drawing-related socket events (draw, erase, edit, clear)
    registerDrawingHandlers(io, socket, permission, userId, userEmail);

    // Register all text-related socket events (addText, backspaceText, editText)
    registerTextHandlers(io, socket, permission, userId, userEmail);

    /**
     * Triggered when a user disconnects (closes tab, loses connection, etc.)
     * Logs the disconnection with the socket ID.
     */
    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};
