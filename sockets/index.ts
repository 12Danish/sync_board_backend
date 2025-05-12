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

  io.on("connection", (socket: Socket) => {
    console.log("A user connected with the socket id", socket.id);

    /**
     * Joins the socket to a room identified by the board ID.
     * Rooms are used to group sockets working on the same board so events are scoped correctly.
     *

     */

    const userId = (socket as any).user.id;
    const userEmail = (socket as any).user.email;

    socket.on("joinBoard", async (boardId: string) => {
      const previousBoardId = (socket as any).currentBoardId;

      // Leave previous board if any
      if (previousBoardId && socket.rooms.has(previousBoardId)) {
        socket.leave(previousBoardId);
        console.log(`User ${socket.id} left previous board ${previousBoardId}`);
        (socket as any).currentBoardId = null;
      }

      const permission = await socketPermMiddleware(socket, boardId);

      if (permission) {
        socket.join(boardId);
        (socket as any).currentBoardId = boardId; // ✅ SET BOARD ID
        (socket as any).permission = permission; // ✅ SET PERMISSION

        console.log(`User ${socket.id} joined board ${boardId}`);
        socket.emit("joinedBoard", { boardId, userEmail, userId });

        // registering relevant handlers on joining a new board
        registerCursorHandler(io, socket, permission, userId, userEmail);
        registerDrawingHandlers(io, socket, permission, userId, userEmail);
        registerTextHandlers(io, socket, permission, userId, userEmail);
      } else {
        socket.emit(
          "error",
          new CustomError("You do not have permission to draw.", 403)
        );
      }
    });

    socket.on("leaveBoard", (boardId: string) => {
      const currentBoardId = (socket as any).currentBoardId;

      if (currentBoardId !== boardId) {
        socket.emit(
          "error",
          new CustomError("You are not currently in this board", 400)
        );
        return;
      }

      if (socket.rooms.has(boardId)) {
        socket.leave(boardId);
        (socket as any).currentBoardId = null;
        (socket as any).permission = null;

        console.log(`User with socket id ${socket.id} left board ${boardId}`);
        socket.emit("leftBoard", { boardId, userEmail, userId });
      } else {
        socket.emit(
          "error",
          new CustomError("You are not currently in this board", 400)
        );
      }
    });

    /**
     * Triggered when a user disconnects (closes tab, loses connection, etc.)
     * Logs the disconnection with the socket ID.
     */
    socket.on("disconnect", () => {
      // Retrieve the current board ID the user is on
      const currentBoardId = (socket as any).currentBoardId;

      if (currentBoardId) {
        // Emit "leaveBoard" to all other users in the board room
        socket.to(currentBoardId).emit("leaveBoard", currentBoardId);

        // Log that the user is leaving the board
        console.log(`User ${socket.id} left board ${currentBoardId}`);

        // Optionally, clear any additional user-specific properties
        (socket as any).currentBoardId = null;
        (socket as any).permission = null;
      }
      console.log("User disconnected", socket.id);
    });
  });
};
