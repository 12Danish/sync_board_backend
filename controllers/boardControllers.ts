import asyncHandler from "express-async-handler";
import Board from "../models/boardModel";
import jwt from "jsonwebtoken";
import { BoardCRDServices } from "../services/boardServices/cRDServices";

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

    const boardsThumbnailData = await BoardCRDServices.getBoardThumbnailData(userId);

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
 * collaborators : [string]
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
    const newBoard = await BoardCRDServices.createBoard({
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

//@desc Get specific complete data for user board
//@access Private Only for logged in users
//@route GET /api/board:id
const getUserBoardData = asyncHandler(async (req, res) => {});

//@desc PUT specific update specific board
//@access Private Only for logged in users
//@route PUT /api/board:id
const updateUserBoardData = asyncHandler(async (req, res) => {});

//@desc DEL delete user board
//@access Private Only for logged in users
//@route GET /api/board:id
const deleteUserBoard = asyncHandler(async (req, res) => {});
// Use export instead of module.exports
export {
  updateUserBoardData,
  getUserBoardsThumbnailData,
  getUserBoardData,
  createUserBoard,
  deleteUserBoard,
};
