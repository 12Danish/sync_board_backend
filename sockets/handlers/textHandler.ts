import { Server, Socket } from "socket.io";
import { CustomError } from "../../utils/customError";
import { socketShapeService } from "../../services/boardServices/socketShapeUpdateService";
/**
 * Registers socket event handlers related to text manipulation on the board.
 *
 * @param io - The Socket.IO server instance.
 * @param socket - The socket instance representing the connected client.
 *
 * Handles:
 * - Adding new text
 * - Removing text characters (e.g., backspace)
 * - Editing existing text content
 */
export const registerTextHandlers = (
  io: Server,
  socket: Socket,
  permission: any,
  userId: string,
  userEmail: string
) => {
  if (permission !== "edit") {
    socket.emit(
      "error",
      new CustomError("You do not have permission to alter text.", 403)
    );
    return; // Stop further event handling
  }
  /**
   * Listens for 'addText' events and broadcasts the new text object
   * to all clients in the same board room.
   * Attempts to synchronise changes to db by calling socketShapeService
   * @param data - Text data including position, style, content, and boardId.
   */
  socket.on("addText", async (data) => {
    console.log("Adding new text:", data);
    io.to(data.boardId).emit("addedText", { ...data, userEmail, userId });

    // 2. Save to DB asynchronously
    try {
      await socketShapeService({
        changerId: userId,
        boardId: data.boardId,
        new_shapes: data.updatedBoardShapes,
      });
    } catch (error: any) {
      console.error("Failed to save shapes to DB:", error);

      // 3. Optionally notify only the sender
      socket.emit("error", {
        message:
          error.message ||
          "Failed to save board changes. Your edits might not be saved permanently.",
      });
    }
  });

  /**
   * Listens for 'backspaceText' events and broadcasts the updated
   * text state after a backspace operation to the board room.
   *Attempts to synchronise changes to db by calling socketShapeService
   * @param data - Data containing the boardId and affected text object or ID.
   */
  socket.on("backspaceText", async (data) => {
    console.log("Backspacing text:", data);
    io.to(data.boardId).emit("backspacedText", { ...data, userEmail, userId }); // 2. Save to DB asynchronously
    try {
      await socketShapeService({
        changerId: userId,
        boardId: data.boardId,
        new_shapes: data.updatedBoardShapes,
      });
    } catch (error: any) {
      console.error("Failed to save shapes to DB:", error);

      // 3. Optionally notify only the sender
      socket.emit("error", {
        message:
          error.message ||
          "Failed to save board changes. Your edits might not be saved permanently.",
      });
    }
  });

  /**
   * Listens for 'editText' events and broadcasts the updated text content
   * (e.g., content change, formatting) to all users in the same board room.
   *Attempts to synchronise changes to db by calling socketShapeService
   * @param data - Data including boardId, textId, and updated content or style.
   */
  socket.on("editText", async (data) => {
    console.log("Editing text:", data);
    io.to(data.boardId).emit("editedText", { ...data, userEmail, userId });
    // 2. Save to DB asynchronously
    try {
      await socketShapeService({
        changerId: userId,
        boardId: data.boardId,
        new_shapes: data.updatedBoardShapes,
      });
    } catch (error: any) {
      console.error("Failed to save shapes to DB:", error);

      // 3. Optionally notify only the sender
      socket.emit("error", {
        message:
          error.message ||
          "Failed to save board changes. Your edits might not be saved permanently.",
      });
    }
  });
};
