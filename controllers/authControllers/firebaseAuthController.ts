import asyncHandler from "express-async-handler";
import {firebaseLoginService} from "../../services/authServices/firebaseAuthServices";

/**
 * @desc    Login user using Firebase token (Google/GitHub login)
 * @route   POST /api/firebaseLogin
 * @access  Public
 *
 * @headers
 * Content-Type: application/json
 *
 * @body
 * {
 *   "firebaseToken": "string" // Firebase ID token obtained from client after Google/GitHub login
 * }
 *
 * @cookies
 * Sets an HTTP-only cookie named `token` containing the JWT for session management
 *
 * @returns
 * {
 *   "message": "Login successful",
 *   "user": {
 *     "email": "string",
 *     "authProvider": "google | github"
 *   }
 * 
 * @errors 
 * - 500 in case of unexpected error
 * }
 */

const firebaseLogin = asyncHandler(async (req, res) => {
  const { firebaseToken } = req.body;

  try {
    const { token, user } = await firebaseLoginService(firebaseToken);

    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      sameSite: "none", // Allow cross-origin cookies
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Return the user details and a success message
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

export { firebaseLogin };
