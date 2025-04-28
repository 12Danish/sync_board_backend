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

/**
 * @swagger
 * /api/board/{id}:
 *   delete:
 *     summary: Delete a user board
 *     description: Allows authenticated users to delete a board they own.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the board to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Board successfully deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully deleted board"
 *       403:
 *         description: Forbidden - User is not the owner of the board.
 *       404:
 *         description: Not Found - Board not found.
 *       500:
 *         description: Unexpected server error while trying to delete the board.
 */
/**
 * @swagger
 * /api/board/{id}:
 *   get:
 *     summary: Get complete data for a specific user board
 *     description: Retrieves board data if the user is the owner or a collaborator. Only accessible to authenticated users.
 *     tags:
 *       - Boards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the board to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board data successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f9c25adf1f5d3a1c3345c9"
 *                 name:
 *                   type: string
 *                   example: "Project Planning Board"
 *                 createdBy:
 *                   type: string
 *                   example: "64f8d33a1f5c5e2d8b3f3c92"
 *                 collaborators:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["64f8d33a1f5c5e2d8b3f3c92", "64f9c25adf1f5d3a1c3345c9"]
 *                 shapes:
 *                   type: array
 *                   items:
 *                     type: object
 *                   example: [{ "type": "rectangle", "position": { "x": 10, "y": 20 } }]
 *                 thumbnail_img:
 *                   type: string
 *                   example: "https://example.com/thumbnail.jpg"
 *                 security:
 *                   type: string
 *                   enum: [public, private]
 *                   example: "private"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-07-14T12:00:00Z"
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-07-15T15:30:00Z"
 *       403:
 *         description: Forbidden - User does not have permission to view the board.
 *       404:
 *         description: Not Found - Board not found.
 *       500:
 *         description: Unexpected server error while trying to retrieve the board.
 */
router
  .route("/board/:id")
  .get(
    ValidationMiddleWare.validateToken(),
    BoardMiddleware.checkIdInParam(),
    getUserBoardData
  )
  .delete(
    ValidationMiddleWare.validateToken(),
    BoardMiddleware.checkIdInParam(),
    deleteUserBoard
  );

export default router;
