import asyncHandler from "express-async-handler";
import Board from "../models/boardModel";

//@desc Get data of boards to display on thumbnail
//@access Private . Only for logged in users
//@route GET/api/getBoards
const getUserBoardsThumbnailData = asyncHandler(async (req, res) => {});

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
