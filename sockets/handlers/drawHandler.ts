import { Socket, Server } from "socket.io";
import { CustomError } from "../../utils/customError";
/**
 * Registers socket event handlers related to drawing actions.
 *
 * @param io - The main Socket.IO server instance.
 * @param socket - The individual socket connection for the client.
 *
 * This function sets up listeners on the connected socket to handle:
 * - Drawing shapes
 * - Erasing shapes
 * - Editing shapes (e.g., color or size changes)
 * - Clearing the entire board
 *
 * These events are broadcasted to all clients in the same board room.
 */
export const registerDrawingHandlers = (
  io: Server,
  socket: Socket,
  permission: any
) => {
  if (permission !== "edit") {
    socket.emit(
      "error",
      new CustomError("You do not have permission to draw.", 403)
    );
    return; // Stop further event handling
  }

  /**
   * Listens for 'draw' events and broadcasts the new drawing data to all users
   * in the same board room.
   *
   * @param data - The drawing data, expected to include at least a `boardId` and shape details.
   */

  socket.on("draw", (data: any) => {
    console.log("Drawing data for shape received:", data);
    io.to(data.boardId).emit("newDrawing", data);
  });

  /**
   * Listens for 'erase' events and broadcasts the erase action to users in the board room.
   *
   * @param data - Data related to the erase action, including the board ID and target object.
   */
  socket.on("erase", (data) => {
    console.log("Erase shape action:", data);
    io.to(data.boardId).emit("erase", data);
  });

  /**
   * Listens for 'editShape' events and broadcasts the updated shape data
   * (e.g., color, size) to users in the same board.
   *
   * @param data - Data containing the board ID and the updated shape properties.
   */
  socket.on("editShape", (data) => {
    console.log("Edit shape action:", data);
    io.to(data.boardId).emit("editShape", data);
  });

  /**
   * Listens for 'clearBoard' events and notifies all users in the board room
   * to clear their canvas.
   *
   * @param boardId - The ID of the board to be cleared.
   */
  socket.on("clearBoard", (boardId: string) => {
    console.log(`Clearing board: ${boardId}`);
    io.to(boardId).emit("clearBoard");
  });
};
