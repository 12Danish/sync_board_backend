import { ObjectId } from "mongoose";
import User from "../../models/userModel";
import { CustomError } from "../../utils/customError";
/**
 * Retrieves basic user information by ID.
 *
 * - Searches for a user in the database using the provided ObjectId.
 * - If no user is found, throws a 404 error.
 *
 * @param {ObjectId | string} userId - The MongoDB ObjectId of the user to retrieve.
 *
 * @throws {CustomError} - Throws a 404 error if the user does not exist.
 *
 * @returns {Promise<User>} The user document with `username` and `email` fields.
 */

const userGetService = async (userId: ObjectId | string) => {
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
  } catch (err: any) {
    // If the error is already a CustomError, rethrow it
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(
      `The following unexpected error occurred when trying to get user${err}`,
      500
    );
  }
};

/**
 * Searches for users by partial `username` and/or `email`.
 *
 * - Performs a case-insensitive partial match on the `username` and `email` fields.
 * - If both `username` and `email` are provided, both conditions are applied.
 * - If no users match the query, throws a 404 error.
 *
 * @param {Object} params - The search parameters.
 * @param {string | null} params.username - The partial username to search for (optional).
 * @param {string | null} params.email - The partial email to search for (optional).
 *
 * @throws {CustomError} - Throws a 404 error if no users are found.
 * @throws {CustomError} - Throws a 500 error if an unexpected error occurs during the query.
 *
 * @returns {Promise<User[]>} An array of user documents that match the partial search criteria.
 */

const searchUserService = async ({
  username,
  email,
}: {
  username: string | null;
  email: string | null;
}) => {
  try {
    const query: any = {};

    if (username) {
      query.username = { $regex: username, $options: "i" };
    }

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    const users = await User.find(query);

    if (!users || users.length === 0) {
      throw new CustomError("No matching users found", 404);
    }

    return users;
  } catch (err: any) {
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(
      `An unexpected error occurred while trying to get users: ${
        err.message || err
      }`,
      500
    );
  }
};

export { userGetService, searchUserService };
