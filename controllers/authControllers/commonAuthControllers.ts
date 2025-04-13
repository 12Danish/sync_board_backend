import asyncHandler from "express-async-handler";
import { CustomError } from "../../utils/customError";
import { userGetService } from "../../services/authServices/commonAuthServices";
import jwt from "jsonwebtoken";
/**
 * @desc    Logout user by clearing the authentication token cookie
 * @route   GET /api/userLogout
 * @access  Private
 *
 * @sets-cookie
 * Clears the HTTP-only cookie named `token` by setting its expiration
 *
 * @returns
 * {
 *   "message": "Successfully logged out"
 * }
 */
const userLogout = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set true in production
      sameSite: "none",
    });

    res.status(200).json({ message: "Successfully logged out" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 * @desc    Controller for users to get their profile info
 * @route   GET /api/UserProfile
 * @access  Private
 *
 * @headers
 * Authorization: Bearer <JWT_TOKEN>
 *
 * @cookies
 * token=JWT_TOKEN; HttpOnly; Secure; SameSite=None
 *
 * @returns
 * {
 *   "username?": "string", // only for local auth
 *   "email": "string",
 *   "authProvider": "local",
 *   "createdAt" : "Date",
 *   "updatedAt" : "Date"
 *
 * }
 *
 * @errors
 * - 404 User not found if no user exists for the decoded token
 */

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const user = await userGetService(userId);

    if (user) {
      res.status(200).json(user);
    } else {
      throw new CustomError("User not found", 404);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

export { userLogout, getUserProfile };
