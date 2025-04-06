import asyncHandler from "express-async-handler";
import User from "../../models/userModel";
import { UserAuthServices } from "../../services/authServices/userAuthServices";
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
const userLogin = asyncHandler(async () => {});

// @desc Controller for users to get their perofile info
// @access private
// @route GET api/UserProfile
const getUserProfile = asyncHandler(async () => {});

// @desc Controller for users to get their perofile info
// @access private
// @route PUT api/UserProfile
const updateUserProfile = asyncHandler(async () => {});

export { userLogin, userRegister, getUserProfile, updateUserProfile };
