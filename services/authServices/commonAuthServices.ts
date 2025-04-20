import { ObjectId } from "mongoose";
import User from "../../models/userModel";
import { CustomError } from "../../utils/customError";
/**
 * Retrieves basic user information by ID.
 *
 * - Searches for a user in the database using the provided ObjectId.
 * - If no user is found, throws a 404 error.
 *
 * @param {ObjectId} userId - The MongoDB ObjectId of the user to retrieve.
 *
 * @throws {CustomError} - Throws a 404 error if the user does not exist.
 *
 * @returns {Promise<User>} The user document with `username` and `email` fields.
 */

export const userGetService = async (userId: ObjectId) => {
  try {
    // Finding the relevant user
    const user = await User.findById(userId);

    // Throwing error if user doesnt exist
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    let returnData: any = {
      email: user.email,
      authProvider: user.authProvider,
    };

    if (user.authProvider == "local") {
      returnData.username = user.username;
    }

    return returnData;
  } catch (err) {
    throw new CustomError(
      `The following unexpected error occurred when trying to get user${err}`,
      500
    );
  }
};
