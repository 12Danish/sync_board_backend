import express, { Router } from "express";

import { firebaseLogin } from "../../controllers/authControllers/firebaseAuthController";

const router: Router = express.Router();


/**
 * @swagger
 * /api/firebaseLogin:
 *   post:
 *     summary: Login user using Firebase token (Google/GitHub login)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firebaseToken
 *             properties:
 *               firebaseToken:
 *                 type: string
 *                 description: Firebase ID token obtained after login from frontend (Google or GitHub)
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=JWT_TOKEN; HttpOnly; Secure; SameSite=None; Max-Age=86400
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     authProvider:
 *                       type: string
 *                       enum: [google, github]
 *       500:
 *         description: Internal server error
 */
router.route("/firebaseLogin").post(firebaseLogin);

export default router;
