import express, { Router } from "express";

import {
  userLogout,
  getUserProfile,
} from "../../controllers/authControllers/commonAuthControllers";
import { ValidationMiddleWare } from "../../middleware/authHandler";
const router: Router = express.Router();

/**
 * @swagger
 * /api/userLogout:
 *   get:
 *     summary: Logout user by clearing the authentication token cookie
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully logged out
 *       500:
 *         description: Internal server error
 */
router
  .route("/userLogout")
  .get(ValidationMiddleWare.validateToken(), userLogout);

/**
 * @swagger
 * /api/userProfile:
 *   get:
 *     summary: Get user profile information for both Firebase and Custom User
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   description: Only for local authentication (if available)
 *                 email:
 *                   type: string
 *                   description: User email address
 *                 authProvider:
 *                   type: string
 *                   description: Provider of authentication (e.g., "local")
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Account creation timestamp
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Last profile update timestamp
 *       404:
 *         description: User not found (if the token does not correspond to a valid user)
 *       500:
 *         description: Internal server error
 */
router
  .route("/userProfile")
  .get(ValidationMiddleWare.validateToken(), getUserProfile);
export default router;
