import Board from "../../models/boardModel";
import { CustomError } from "../../utils/customError";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";
interface createBoardInput {
  name: string;
  security: "public" | "private";
  owner: ObjectId;
  collaborators?: ObjectId[];
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
  static async getBoardThumbnailData(userId: ObjectId) {
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
   *   owner: ObjectId,
   *   collaborators?: ObjectId[]
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
  static async createBoard(data: createBoardInput) {
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
}

export { BoardCRDServices };
