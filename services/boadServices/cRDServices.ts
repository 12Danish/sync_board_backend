import Board from "../../models/boardModel";
import { CustomError } from "../../utils/customError";
import { ObjectId } from "mongodb";

class BoardCRDServices {
  static async getBoardThumbnailData(userId: ObjectId) {
    const boards = await Board.find({
      $or: [{ createdBy: userId }, { collaborators: userId }],
    });

    // Returning empty array if no boards for user found
    if (!boards) {
      return [];
    }
    // Returning the data as an array of Objects
    else {
      const boardThumbnails = boards.map((board) => ({
        _id: board._id,
        name: board.name,
        thumbnail_img: board.thumbnail_img,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
        security : board.security,
        role:
          board.createdBy.toString() === userId.toString()
            ? "owner"
            : "collaborator",
      }));
      return boardThumbnails;
    }
  }
}


export {BoardCRDServices}