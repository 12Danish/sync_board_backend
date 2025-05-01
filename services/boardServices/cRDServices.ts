import Board, { IBoard, ICollaborator } from "../../models/boardModel";
import { CustomError } from "../../utils/customError";
import { ObjectId } from "mongodb";
import { Types } from "mongoose";
interface createBoardServiceInput {
  name: string;
  security: "public" | "private";
  owner: ObjectId | string;
  collaborators?: ICollaborator[];
}

interface delAndGetBoardServiceInput {
  userId: ObjectId | string;
  boardId: string;
}

interface searchBoardServiceInput {
  userId: ObjectId | string;
  boardName: string;
}

interface addCollaboratorServiceInput {
  targetUserId: ObjectId | string;
  currentUserId: ObjectId | string;
  boardId: ObjectId | string;
  permission: "edit" | "view";
}
interface deleteCollaboratorServiceInput
  extends Omit<addCollaboratorServiceInput, "permission"> {}

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
        $or: [{ createdBy: userId }, { "collaborators.user": userId }],
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
   *   collaborators?: ICollaborator[]
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
        collaborators:
          collaborators?.map((collab) => ({
            user: new Types.ObjectId(collab.user),
            permission: collab.permission,
          })) || [],
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
      const selBoard = await Board.findById(data.boardId)
        .populate({
          path: "collaborators.user", // path to populate
          select: "username email authProvider",
        })
        .populate({
          path: "createdBy",
          select: "username email authProvider",
        });

      if (!selBoard) {
        throw new CustomError("The requesdted board does not exist ", 404);
      }

      if (selBoard.security == "public") {
        return selBoard;
      } else {
        const isCollaborator = selBoard.collaborators.some(
          (collab: any) => collab.user.toString() === data.userId.toString()
        );
        if (
          selBoard.createdBy._id.toString() === data.userId.toString() ||
          isCollaborator
        ) {
          return selBoard;
        } else {
          console.log("This is the createdBy");
          console.log(selBoard.createdBy.toString());
          console.log("This is input");
          console.log(data.userId.toString());
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
   * @returns {IBoard[]} Returns an array of board documents excluding `shapes` that match the name and are accessible to the user.
   */
  static async searchBoardService(data: searchBoardServiceInput) {
    try {
      const boards = await Board.find({
        name: { $regex: data.boardName, $options: "i" }, // this makes sure to search if the entered value is part of a longer name(case insensitive)
        $or: [
          { createdBy: data.userId },
          { "collaborators.user": data.userId },
        ],
      }).select("-shapes");

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

  /**
   * Adds a new collaborator to a specified board.
   *
   * - Finds the board by the provided `boardId`.
   * - Checks if the requesting user is the owner of the board.
   * - Verifies if the target user is already a collaborator.
   * - If the target user is not a collaborator, adds them to the `collaborators` array with the specified permission.
   * - Saves the updated board.
   *
   * @param { {
   *   boardId: ObjectId | string,       // The ID of the board to which the collaborator is being added
   *   currentUserId: ObjectId | string,  // The ID of the user attempting to add the collaborator (must be the owner)
   *   targetUserId: ObjectId | string,   // The ID of the user being added as a collaborator
   *   permission: "view" | "edit"       // The permission level being assigned to the target user (either "view" or "edit")
   * } } data - Object containing the `boardId`, `currentUserId`, `targetUserId`, and `permission` for adding the collaborator.
   *
   * @throws {CustomError} 404 if the specified board is not found.
   * @throws {CustomError} 403 if the requesting user is not the owner of the board.
   * @throws {CustomError} 400 if the target user is already a collaborator on the board.
   * @throws {CustomError} 500 for any other internal error.
   *
   * @returns {boolean} Returns `true` if the collaborator is successfully added to the board.
   */

  static async addCollaboratorService(data: addCollaboratorServiceInput) {
    try {
      const board: IBoard | null = await Board.findById(data.boardId);

      if (!board) {
        throw new CustomError("No board corresponding to the id found", 404);
      }

      const isOwner = BoardCRDServices.checkIfowner({
        board,
        currentUserId: data.currentUserId,
      });

      if (!isOwner) {
        throw new CustomError("Only owner can add new collaborators !", 403);
      }

      // Check if the target user is already in the collaborators array
      const collaboratorExists = board.collaborators.some(
        (collab) => collab.user.toString() === data.targetUserId.toString()
      );

      // If the target user is already a collaborator, throw an error
      if (collaboratorExists) {
        throw new CustomError("This user is already a collaborator", 400);
      }

      // Add the new collaborator to the collaborators array
      board.collaborators.push({
        user: new Types.ObjectId(data.targetUserId),
        permission: data.permission, // assuming permission comes from the request
      });

      // Save the updated board
      await board.save();

      return true;
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

  /**
   * Removes an existing collaborator from a specified board.
   *
   * - Retrieves the board by the provided `boardId`.
   * - Ensures that the user making the request (`currentUserId`) is the owner of the board.
   * - Searches for the collaborator specified by `targetUserId` in the board's `collaborators` array.
   * - If the collaborator exists, removes them from the board and saves the updated board document.
   *
   * @param { {
   *   boardId: ObjectId | string,        // The ID of the board from which the collaborator is to be removed
   *   currentUserId: ObjectId | string,  // The ID of the user making the request (must be the board owner)
   *   targetUserId: ObjectId | string    // The ID of the user to be removed from the collaborators list
   * } } data - Object containing the board ID, current user ID, and target user ID.
   *
   * @throws {CustomError} 404 if the board or the target user is not found.
   * @throws {CustomError} 403 if the requesting user is not the owner of the board.
   * @throws {CustomError} 500 for any other internal error.
   *
   * @returns {boolean} Returns `true` if the collaborator is successfully removed.
   */

  static async deleteCollaboratorService(data: deleteCollaboratorServiceInput) {
    try {
      const board: IBoard | null = await Board.findById(data.boardId);

      if (!board) {
        throw new CustomError("No board corresponding to the id found", 404);
      }

      const isOwner = BoardCRDServices.checkIfowner({
        board,
        currentUserId: data.currentUserId,
      });

      if (!isOwner) {
        throw new CustomError("Only owner can add remove collaborators !", 403);
      }
      const index = board.collaborators.findIndex(
        (collab) => collab.user.toString() === data.targetUserId.toString()
      );

      if (index === -1) {
        throw new CustomError("User is not a collaborator", 404);
      }

      // Remove the collaborator
      board.collaborators.splice(index, 1);
      await board.save();

      return true;
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

  /**
   *
   * @param { {
   *   boardId: ObjectId | string,        // The ID of the board from which the collaborator is to be removed
   *   currentUserId: ObjectId | string,  // The ID of the user making the request (must be the board owner)
   * } } data
   * @returns {true} if current user is in createdBy of the board
   */
  static checkIfowner({
    board,
    currentUserId,
  }: {
    board: IBoard;
    currentUserId: ObjectId | string;
  }) {
    return board.createdBy.toString() === currentUserId.toString();
  }
}

export { BoardCRDServices };
