import { Server, Socket } from "socket.io";
import { registerDrawingHandlers } from "./handlers/drawHandler";
import { registerTextHandlers } from "./handlers/textHandler";
import { socketAuthMiddleware } from "../middleware/socket/authHandler";
import { socketPermMiddleware } from "../middleware/socket/permHandler";
import { registerCursorHandler } from "./handlers/cursorHandler";
import { CustomError } from "../utils/customError";



/**
 * Registers the main socket event listeners for the application.
 */
export const registerSocketHandlers = (io: Server) => {
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket) => {
    console.log("A user connected with the socket id", socket.id);

    const userId = (socket as any).user.id;
    const userEmail = (socket as any).user.email;

    socket.on("joinBoard", async (boardId: string) => {
      const previousBoardId = (socket as any).currentBoardId;

      // Leave previous board if necessary
      if (previousBoardId) {
        handleLeaveBoard(socket, previousBoardId, userEmail, userId);
      }

      const permission = await socketPermMiddleware(socket, boardId);

      if (permission) {
        socket.join(boardId);
        (socket as any).currentBoardId = boardId;
        (socket as any).permission = permission;

        console.log(`User ${socket.id} joined board ${boardId}`);
        socket.emit("joinedBoard", { boardId, userEmail, userId });

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

      handleLeaveBoard(socket, boardId, userEmail, userId);
    });

    socket.on("disconnect", () => {
      const currentBoardId = (socket as any).currentBoardId;

      if (currentBoardId) {
        handleLeaveBoard(socket, currentBoardId, userEmail, userId);
      }

      console.log("User disconnected", socket.id);
    });
  });
};

/**
 * Handles a user leaving a board, including room removal and cleanup.
 */
const handleLeaveBoard = (socket: Socket, boardId: string, userEmail: string, userId: string) => {
  if (socket.rooms.has(boardId)) {
    socket.leave(boardId);
    socket.to(boardId).emit("leaveBoard", { boardId, userEmail, userId });
    socket.emit("leftBoard", { boardId, userEmail, userId });
    console.log(`User ${socket.id} left board ${boardId}`);
  }

  (socket as any).currentBoardId = null;
  (socket as any).permission = null;
};