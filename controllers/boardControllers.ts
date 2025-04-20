import asyncHandler from "express-async-handler";
import Board from "../models/boardModel";
import jwt from "jsonwebtoken";
import { BoardCRDServices } from "../services/boadServices/cRDServices";
//@desc Get data of boards to display on thumbnail
//@access Private . Only for logged in users
//@route GET/api/getBoards
const getUserBoardsThumbnailData = asyncHandler(async (req, res) => {
  const decoded = req.user as jwt.JwtPayload;
  const userId = decoded.id;

  const boardsThumbnailData = BoardCRDServices.getBoardThumbnailData(userId)

  res.status(200).json(boardsThumbnailData)


});

//@desc POST creating new board for a user
//@access Private Only for logged in users
//@route POST /api/createBoard
const createUserBoard = asyncHandler(async (req, res) => {});

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
