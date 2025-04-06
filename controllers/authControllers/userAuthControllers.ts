import asyncHandler from "express-async-handler";

// @desc Controller for users to register locally
// @access public
// @route POST api/userRegister
const userRegister = asyncHandler(async () => {});

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
