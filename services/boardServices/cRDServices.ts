import Board from "../../models/boardModel";
import { CustomError } from "../../utils/customError";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";
interface createBoardServiceInput {
  name: string;
  security: "public" | "private";
  owner: ObjectId | string;
  collaborators?: ObjectId[] | string[];
}

interface delAndGetBoardServiceInput {
  userId: ObjectId | string;
  boardId: string;
}

interface searchBoardServiceInput {
  userId: ObjectId | string;
  boardName: string;
}
class BoardCRDServices {
  /**
   * Retrieves board thumbnail data for a specific user.
   *
   * - Searches for boards where the user is either the creator or a collaborator.
   * - If no boards are found, returns an empty array.
   * - Maps each board to an object containing:
   *   - `_id`, `name`, `thumbnail_img`, `createdAt`, `updatedAt`, `security`
   *   - `role`: Indicates if the user is the "owner" or a "collaborator"
   *
   * @param {ObjectId} userId - The MongoDB ObjectId of the user requesting board data.
   *
   *
   * @returns {Promise<Array<Object>>} Array of board thumbnail objects for display.
   */
  static async getBoardThumbnailDataService(userId: ObjectId | string) {
    try {
      const boards = await Board.find({
        $or: [{ createdBy: userId }, { collaborators: userId }],
      });

      // Returning empty array if no boards for user found
      if (!boards || boards.length === 0) {
        return [];
      }

      // Returning the data as an array of Objects
      const boardThumbnails = boards.map((board) => ({
        _id: board._id,
        name: board.name,
        thumbnail_img: board.thumbnail_img,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        security: board.security,
        role:
          board.createdBy.toString() === userId.toString()
            ? "owner"
            : "collaborator",
      }));

      return boardThumbnails;
    } catch (err) {
      throw new CustomError(
        `The following error occurred while trying to get user boards: ${err}`,
        500
      );
    }
  }

  /**
   * Attempts to create a new board object.
   *
   * @param {{
   *   name: string,
   *   security: "public" | "private",
   *   owner: ObjectId | string,
   *   collaborators?: ObjectId[] | string[]
   * }} data - Board creation input data.
   *
   * @throws {Error} 500 error in case of a failed operation.
   *
   * @returns {{
   *   _id: ObjectId,
   *   name: string,
   *   createdAt: Date,
   *   updatedAt: Date
   * }} The newly created board object.
   */
  static async createBoardService(data: createBoardServiceInput) {
    try {
      const { name, security, owner, collaborators } = data;

      const newBoard = await Board.create({
        name,
        createdBy: new Types.ObjectId(owner),
        collaborators: collaborators?.map((id) => new Types.ObjectId(id)) || [],
        shapes: [],
        thumbnail_img: "",
        security: security || "private",
      });

      return {
        _id: newBoard._id,
        name: newBoard.name,
        createdAt: newBoard.createdAt,
        updatedAt: newBoard.updatedAt,
      };
    } catch (err: any) {
      if (err.code === 11000) {
        // Duplicate key error — likely createdBy + name conflict
        throw new CustomError(
          `A board with the name "${data.name}" already exists for this user.`,
          400 // Conflict HTTP status code
        );
      }

      // Generic server error fallback
      throw new CustomError(
        `The following error occurred while trying to create user boards: ${
          err.message || err
        }`,
        500
      );
    }
  }

  /**
   * Attempts to delete a board if the requesting user is its owner.
   *
   * - Finds the board by its `boardId`.
   * - Validates if the board exists.
   * - Checks if the requesting user (identified by `userId`) is the owner of the board.
   * - If validation passes, deletes the board.
   *
   * @param {{
   *   boardId: string,
   *   userId: ObjectId | string
   * }} data - Object containing the board ID to be deleted and the user ID requesting deletion.
   *
   * @throws {CustomError} 404 if the board does not exist.
   * @throws {CustomError} 403 if the user is not the owner of the board.
   * @throws {CustomError} 500 for any other internal error.
   *
   * @returns {boolean} Returns `true` if the board was successfully deleted.
   */
  static async deleteBoardService(data: delAndGetBoardServiceInput) {
    try {
      const userBoard = await Board.findById(data.boardId);

      // If the board is not found, throw a 404 error
      if (!userBoard) {
        throw new CustomError("Board not found", 404);
      }

      // If the user is not the owner, throw a 403 error
      if (userBoard.createdBy.toString() !== data.userId.toString()) {
        throw new CustomError(
          "You do not have permission to delete. Only the owner can delete",
          403
        );
      }

      // If the user is the owner, delete the board
      await userBoard.deleteOne();

      return true;
    } catch (err: any) {
      // If the error is already a CustomError, rethrow it
      if (err instanceof CustomError) {
        throw err;
      }

      // Generic error handler
      throw new CustomError(
        `The following error occurred while trying to delete the board: ${
          err.message || err
        }`,
        500
      );
    }
  }

  /**
   * Retrieves a board if the requesting user has permission to view it.
   *
   * - Finds the board by its `boardId`.
   * - Validates if the board exists.
   * - If the board is public, returns it immediately.
   * - If the board is private, checks if the requesting user (identified by `userId`)
   *   is either the owner (createdBy) or a collaborator.
   * - If validation passes, returns the board.
   *
   * @param { {
   *   boardId: string,
   *   userId: ObjectId | string
   * } } data - Object containing the board ID to retrieve and the user ID requesting access.
   *
   * @throws {CustomError} 404 if the board does not exist.
   * @throws {CustomError} 403 if the user does not have permission to view the board.
   * @throws {CustomError} 500 for any other internal error.
   *
   * @returns {IBoard} Returns the board document if access is granted.
   */
  static async getBoardService(data: delAndGetBoardServiceInput) {
    try {
      const selBoard = await Board.findById(data.boardId);

      if (!selBoard) {
        throw new CustomError("The requesdted board does not exist ", 404);
      }

      if (selBoard.security == "public") {
        return selBoard;
      } else {
        const isCollaborator = selBoard.collaborators.some(
          (collaboratorId) =>
            collaboratorId.toString() === data.userId.toString()
        );
        if (
          selBoard.createdBy.toString() == data.userId.toString() ||
          isCollaborator
        ) {
          return selBoard;
        } else {
          throw new CustomError("You do not have permission to view this", 403);
        }
      }
    } catch (err: any) {
      // If the error is already a CustomError, rethrow it
      if (err instanceof CustomError) {
        throw err;
      }

      // Generic error handler
      throw new CustomError(
        `The following error occurred while trying to get the specified board: ${
          err.message || err
        }`,
        500
      );
    }
  }

  /**
   * Searches for boards with the specified name that the requesting user can access.
   *
   * - Filters boards by the provided `boardName`.
   * - Ensures the board is accessible by checking if the requesting user (identified by `userId`)
   *   is either the creator (`createdBy`) or listed as a collaborator (`collaborators`).
   * - Returns all matching boards accessible to the user.
   *
   * @param { {
   *   boardName: string,
   *   userId: ObjectId | string
   * } } data - Object containing the board name to search for and the user ID requesting access.
   *
   * @throws {CustomError} 404 if no boards matching the criteria are found for the user.
   * @throws {CustomError} 500 for any other internal error.
   *
   * @returns {IBoard[]} Returns an array of board documents that match the name and are accessible to the user.
   */
  static async searchBoardService(data: searchBoardServiceInput) {
    try {
      const boards = await Board.find({
        name: { $regex: data.boardName, $options: "i" }, // this makes sure to search if the entered value is part of a longer name(case insensitive)
        $or: [{ createdBy: data.userId }, { collaborators: data.userId }],
      });

      if (!boards) {
        throw new CustomError(
          "No board with the requested name exists for the current user!",
          404
        );
      }

      return boards;
    } catch (err: any) {
      // If the error is already a CustomError, rethrow it
      if (err instanceof CustomError) {
        throw err;
      }

      // Generic error handler
      throw new CustomError(
        `The following error occurred while trying to search the board: ${
          err.message || err
        }`,
        500
      );
    }
  }
}

export { BoardCRDServices };
