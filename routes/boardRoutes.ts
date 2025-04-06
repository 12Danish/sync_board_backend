import express, { Router } from "express";

import {
  getUserBoardsThumbnailData,
  getUserBoardData,
  updateUserBoardData,
  deleteUserBoard,
  createUserBoard,
} from "../controllers/boardControllers";

const router: Router = express.Router();

router.route("/getBoards").get(getUserBoardsThumbnailData);

router.route("/createBoard").post(createUserBoard);

router
  .route("/board/:id")
  .get(getUserBoardData)
  .put(updateUserBoardData)
  .delete(deleteUserBoard);

export default router;
