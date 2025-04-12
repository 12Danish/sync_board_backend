import asyncHandler from "express-async-handler";
import { UserAuthServices } from "../../services/authServices/userAuthServices";
import jwt from "jsonwebtoken";
import { CustomError } from "../../utils/customError";
// @desc Controller for users to register locally
// @access public
// @route POST api/userRegister
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

// @desc Controller for users to login via JWT
// @access public
// @route POST api/userLogin
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

// @desc Controller for users to get their perofile info
// @access private
// @route GET api/UserProfile
const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const decoded = req.user as jwt.JwtPayload;
    const userId = decoded.id;

    const user = await UserAuthServices.userGetService(userId);

    if (user) {
      res.status(200).json({
        username: user.username,
        email: user.email,
      });
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

// @desc Controller for users to get their perofile info
// @access private
// @route PUT api/UserProfile
const updateUserProfile = asyncHandler(async (req, res) => {});

export { userLogin, userRegister, getUserProfile, updateUserProfile };
