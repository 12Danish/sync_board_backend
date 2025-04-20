import express, { Router } from "express";
import { ValidationMiddleWare } from "../middleware/authHandler";
import {
  getUserBoardsThumbnailData,
  getUserBoardData,
  deleteUserBoard,
  createUserBoard,
} from "../controllers/boardControllers";

const router: Router = express.Router();

router.route("/getBoards").get(ValidationMiddleWare.validateToken(),getUserBoardsThumbnailData);

router.route("/createBoard").post(ValidationMiddleWare.validateToken(),createUserBoard);

router
  .route("/board/:id")
  .get(ValidationMiddleWare.validateToken(),getUserBoardData)
  .delete(ValidationMiddleWare.validateToken(),deleteUserBoard);

export default router;
