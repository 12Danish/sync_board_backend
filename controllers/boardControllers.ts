import asyncHandler from "express-async-handler";
import Board from "../models/boardModel";
import jwt from "jsonwebtoken";
import { BoardCRDServices } from "../services/boardServices/cRDServices";
import { CustomError } from "../utils/customError";

/**
 * @desc    Get data of boards to display on thumbnail
 * @route   GET /api/getBoards
 * @access  Private Only for authenticated users
 *
 * @returns {Promise<Object[] | []>}
 * An array of board objects or an empty array:
 * [
 *   {
 *     "_id": "string",
 *     "name": "string",
 *     "thumbnail_img": "string",
 *     "createdAt": "Date",
 *     "updatedAt": "Date",
 *     "security": "public" | "private",
 *     "role": "owner" | "collaborator"
 *   },
 *   ...
 * ]
 * OR []
 *
 *   @errors
 * - 500 in case of unexpected error
 *
 */
const getUserBoardsThumbnailData = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const boardsThumbnailData =
      await BoardCRDServices.getBoardThumbnailDataService(userId);

    res.status(200).json(boardsThumbnailData);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 *
 * @desc Lets users create a new board
 * @route POST /api/createBoard
 * @access Private
 * @body
 * {
 * security : "public" | "private",
 * name : "string"
 * collaborators : [{user: string , permission : `view` | `edit`}]
 * }
 *
 * @returns status 201 Created
 *
 * {
 * "message" : "board successfully created",
 * "board_data":{
 * "_id": "string",
 * "name" : "string",
 * "createdAt" : "Date",
 * "updatedAt" : "Date",
 *
 * }
 * @errors
 * 500 - Unexpectd error
 */
const createUserBoard = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const { name, security, collaborators } = req.body;
    const newBoard = await BoardCRDServices.createBoardService({
      name,
      security,
      owner: userId,
      collaborators,
    });
    res.status(201).json(newBoard);
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 *
 * @desc Deletes a user board if the logged-in user is the creator
 * @route DELETE /api/board/:id
 * @access Private
 * @param {string} id - The ID of the board to be deleted (from URL params)
 *
 * @returns status 204 No Content
 * {
 *   "message": "Successfully deleted board"
 * }
 *
 * @errors
 * 403 - Unauthorized: User is not the board owner
 * 404 - Board not found
 * 500 - Unexpected error or deletion failure
 */
const deleteUserBoard = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const boardId = req.params["id"];
    const deleted = await BoardCRDServices.deleteBoardService({
      userId,
      boardId,
    });

    if (deleted) {
      res.status(200).json({ message: "Successfully deleted board" });
    } else {
      throw new CustomError("Error with deletion", 500);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 *
 * @desc Retrieves complete data for a specific user board if the user has permission
 * @route GET /api/board/:id
 * @access Private
 * @param {string} id - The ID of the board to retrieve (from URL params)
 *
 * @returns status 200 OK
 * {
 *   "boardData": { ...board details... }
 * }
 *
 * @errors
 * 403 - Unauthorized: User is neither the board owner nor a collaborator
 * 404 - Board not found
 * 500 - Unexpected error during retrieval
 */

const getUserBoardData = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const boardId = req.params["id"];

    const boardData = await BoardCRDServices.getBoardService({
      boardId,
      userId,
    });

    if (boardData) {
      res.status(200).json(boardData);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 *
 * @desc Retrieves all boards matching the provided name that the authenticated user has access to.
 * @route GET /api/board/search/:name
 * @access Private
 * @queryParam {string} name - The name of the board(s) to search for (from URL params)
 *
 * @returns status 200 OK
 * [
 *   { ...board1 details... },
 *   { ...board2 details... }
 * ]
 *
 * @errors
 * 403 - Unauthorized: User token missing or invalid
 * 404 - No boards found with the specified name accessible by the user
 * 500 - Unexpected error during board search
 */
const searchUserBoard = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const boardName = req.query.name as string;

    const boardsData = await BoardCRDServices.searchBoardService({
      boardName,
      userId,
    });

    if (boardsData) {
      res.status(200).json(boardsData);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 *
 * @desc Adds a collaborator to a board if the authenticated user is the board owner.
 * @route POST /api/board/:id/collaborators
 * @access Private
 * @bodyParam {string} targetUserId - ID of the user to be added as a collaborator
 * @bodyParam {string} permission - Permission level to assign to the collaborator
 * @pathParam {string} id - The ID of the board to which the collaborator is being added
 *
 * @returns status 201 Created
 * {
 *   message: "Collaborator successfully added"
 * }
 *
 * @errors
 * 400 - User is already a collaborator
 * 403 - Only the board owner can add collaborators
 * 404 - Board not found
 * 500 - Unexpected error during collaborator addition
 */
const addCollaborator = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const currentUserId = decoded.id;
    const { targetUserId, permission } = req.body;

    const boardId = req.params["id"];

    const added = await BoardCRDServices.addCollaboratorService({
      currentUserId,
      boardId,
      targetUserId,
      permission,
    });

    if (added) {
      res.status(201).json({ message: "Collaborator successfully added" });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 *
 * @desc Removes a collaborator from a board if the authenticated user is the board owner.
 * @route DELETE /api/board/:id/collaborators
 * @access Private
 * @bodyParam {string} targetUserId - ID of the collaborator to be removed
 * @pathParam {string} id - The ID of the board from which the collaborator is being removed
 *
 * @returns status 200 OK
 * {
 *   message: "Collaborator successfully removed"
 * }
 *
 * @errors
 * 403 - Only the board owner can remove collaborators
 * 404 - Board not found or user is not a collaborator
 * 500 - Unexpected error during collaborator removal
 */
const deleteCollaborator = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const currentUserId = decoded.id;
    const { targetUserId } = req.body;
    const boardId = req.params["id"];

    const deleted = await BoardCRDServices.deleteCollaboratorService({
      currentUserId,
      targetUserId,
      boardId,
    });

    if (deleted) {
      res.status(200).json({ message: "Collaborator successfully removed" });
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});
// Use export instead of module.exports
export {
  getUserBoardsThumbnailData,
  getUserBoardData,
  createUserBoard,
  deleteUserBoard,
  searchUserBoard,
  addCollaborator,
  deleteCollaborator,
};
