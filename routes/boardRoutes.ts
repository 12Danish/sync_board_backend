import express, { Router } from "express";
import { ValidationMiddleWare } from "../middleware/authHandler";
import {
  getUserBoardsThumbnailData,
  getUserBoardData,
  deleteUserBoard,
  createUserBoard,
} from "../controllers/boardControllers";
import { BoardMiddleware } from "../middleware/boardHandler";
const router: Router = express.Router();
/**
 * @swagger
 * /api/getBoards:
 *   get:
 *     summary: Get data of boards to display on thumbnail
 *     description: Returns a list of boards (name, thumbnail, timestamps, etc.) the user has access to as an owner or collaborator.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: An array of board thumbnail data.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   thumbnail_img:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   security:
 *                     type: string
 *                     enum: [public, private]
 *                   role:
 *                     type: string
 *                     enum: [owner, collaborator]
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Unexpected server error.
 */

router
  .route("/getBoards")
  .get(ValidationMiddleWare.validateToken(), getUserBoardsThumbnailData);

  /**
 * @swagger
 * /api/createBoard:
 *   post:
 *     summary: Create a new board
 *     description: Allows authenticated users to create a new board with optional collaborators.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - security
 *             properties:
 *               name:
 *                 type: string
 *               security:
 *                 type: string
 *                 enum: [private, public]
 *               collaborators:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Board successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error or duplicate board name for user.
 *       401:
 *         description: Unauthorized - Invalid or missing token.
 *       500:
 *         description: Unexpected server error.
 */
router
  .route("/createBoard")
  .post(
    ValidationMiddleWare.validateToken(),
    BoardMiddleware.validateBoardCreateInput(),
    createUserBoard
  );

router
  .route("/board/:id")
  .get(ValidationMiddleWare.validateToken(), getUserBoardData)
  .delete(ValidationMiddleWare.validateToken(), deleteUserBoard);

export default router;
