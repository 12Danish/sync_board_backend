import asyncHandler from "express-async-handler";
import { UserAuthServices } from "../../services/authServices/userAuthServices";
import jwt from "jsonwebtoken";
import { CustomError } from "../../utils/customError";
/**
 * @desc    Controller for users to register locally
 * @route   POST /api/userRegister
 * @access  Public
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "username": "string",       // Desired username
 *   "email": "string",          // User's email address
 *   "password": "string"        // User's password
 * }
 *
 * @returns
 * {
 *   "message": "User registered successfully",
 *   "user": {
 *      "username" : "string",
 *     "email": "string",
 *     "authProvider": "local",
 *      "createdAt" : "Date",
 *      "updatedAt" : "Date"
 *   }
 *   @errors 
 * - 500 in case of unexpected error
 * 
 */

const userRegister = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = await UserAuthServices.userRegisterService({
      username,
      email,
      password,
    });
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

/**
 * @desc    Controller for users to login via JWT
 * @route   POST /api/userLogin
 * @access  Public
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "email": "string",       // User's registered email address
 *   "password": "string"     // User's password
 * }
 *
 * @cookies
 * Set-Cookie: token=JWT_TOKEN; HttpOnly; Secure; SameSite=None; Max-Age=86400
 *
 * @returns
 * {
 *   "message": "Login successful",
 *   "user": {
 *     "email": "string",
 *     "authProvider": "local"
 *   }
 *   @errors 
 * - 500 in case of unexpected error
 * 
 */

const userLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await UserAuthServices.userLoginService({
      email,
      password,
    });

    // Set JWT token in client cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Will be false for localhost in dev.
      sameSite: "none", // Allow cross-origin cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Return success response with user data
    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});


/** 
 * @desc    Controller for users to update their profile information (local authentication)
 * @route   PUT /api/UserProfile
 * @access  Private
 * 
 * @headers
 * Content-Type: application/json
 * Authorization: Bearer <JWT token> // JWT token for authentication
 * 
 * @body
 * {
 *   "username": "string",  // Optional, new username of the user (cannot be empty, must be provided if updating)
 *   "oldPassword": "string",  // Required if updating password (old password)
 *   "newPassword": "string"   // Required if updating password (new password)
 * }
 * 
 * @returns
 * {  
 *   "username": "string",  // The updated username of the user (if provided)
 *   "email": "string",     // The email of the user (remains unchanged)
 *   "authProvider": "local",  // The authentication provider (local in this case)
 *   "createdAt": "Date",   // The creation date of the user profile
 *   "updatedAt": "Date"    // The last update date of the user profile
 * }
 *   @errors 
 * - 500 in case of unexpected error
 */
const updateLocalUserProfile = asyncHandler(async (req, res) => {
  try {
    const newData = req.body;
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;
    const updatedData = await UserAuthServices.userUpdateService({
      userId,
      newData,
    });

    if (updatedData) {
      res.status(200).json(updatedData);
    } else {
      throw new CustomError("Error with upating", 500);
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    } else {
      throw new Error("An unknown error occurred");
    }
  }
});

export { userLogin, userRegister, updateLocalUserProfile as updateUserProfile };
