import { Socket, Server } from "socket.io";
import { CustomError } from "../../utils/customError";
import {
  socketPageUpdateService,
  socketPageDeleteService,
} from "../../services/boardServices/socketPageServices";
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
  permission: any,
  userId: string,
  userEmail: string
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
   * in the same board room.The data coming in for the shapes will be specific to a page
   *Attempts to synchronise changes to db by calling socketPageService
   * @param data - The drawing data, expected to include at least a `boardId` and shape details.
   */

  socket.on("draw", async (data: any) => {
    console.log("Drawing data for shape received:", data);
    io.to(data.boardId).emit("newDrawing", { ...data, userEmail, userId });
    try {
      await socketPageUpdateService({
        changerId: userId,
        boardId: data.boardId,
        updated_page: data.updatedBoardPage,
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
   * Listens for 'erase' events and broadcasts the erase action to users in the board room.The data coming in for the shapes will be specific to a page
   *Attempts to synchronise changes to db by calling socketPageService
   * @param data - Data related to the erase action, including the board ID and target object.
   */
  socket.on("erase", async (data) => {
    console.log("Erase shape action:", data);
    io.to(data.boardId).emit("erased", { ...data, userEmail, userId });
    try {
      await socketPageUpdateService({
        changerId: userId,
        boardId: data.boardId,
        updated_page: data.updatedBoardPage,
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
   * Listens for 'editShape' events and broadcasts the updated shape data
   * (e.g., color, size) to users in the same board. The data coming in for the shapes will be specific to a page
   *Attempts to synchronise changes to db by calling socketPageService
   * @param data - Data containing the board ID and the updated shape properties.
   */
  socket.on("editShape", async (data) => {
    console.log("Edit shape action:", data);
    io.to(data.boardId).emit("editedShape", { ...data, userEmail, userId });
    try {
      await socketPageUpdateService({
        changerId: userId,
        boardId: data.boardId,
        updated_page: data.updatedBoardPage,
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
   * Listens for 'clearBoard' events and notifies all users in the board room
   * to clear their canvas.The data coming in for the shapes will be specific to a page
   *Attempts to synchronise changes to db by calling socketPageService
   * @param boardId - The ID of the board to be cleared.
   */
  socket.on("clearPage", async (data) => {
    console.log(`Clearing page in board: ${data.boardId}`);
    console.group("This is the data being received in the clearPage");
    console.log(data);
    io.to(data.boardId).emit("clearedPage", { ...data, userEmail, userId });
    try {
      await socketPageUpdateService({
        changerId: userId,
        boardId: data.boardId,
        updated_page: data.updatedBoardPage,
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
   * Listens for 'clearBoard' events and notifies all users in the board room
   * to clear their canvas.The data coming in for the shapes will be specific to a page
   *Attempts to synchronise changes to db by calling socketPageService
   * @param boardId - The ID of the board to be cleared.
   */
  socket.on("deletePage", async (data) => {
    console.log(
      `Deleting page in board: ${data.boardId} with page number ${data.pageNumber}`
    );
    io.to(data.boardId).emit("deletedPage", { userEmail, userId });
    try {
      await socketPageDeleteService({
        changerId: userId,
        boardId: data.boardId,
        pageNumber: data.pageNumber,
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
