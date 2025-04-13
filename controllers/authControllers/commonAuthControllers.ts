import asyncHandler from "express-async-handler";

// @desc Controller for users to logout
// @access private
// @route GET api/userLogout
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

export { userLogout };
