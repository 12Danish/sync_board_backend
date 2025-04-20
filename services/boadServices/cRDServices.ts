import Board from "../../models/boardModel";
import { CustomError } from "../../utils/customError";
import { ObjectId } from "mongodb";

interface createBoardInput {
    name : string ,
    security : "public" | "private",
    collaborators? : ObjectId[]
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
          throw new CustomError(`The following error occurred while trying to get user boards: ${err}`, 500);
        }
      }
      
  static async createBoard(data :createBoardInput){

  }
}


export {BoardCRDServices}