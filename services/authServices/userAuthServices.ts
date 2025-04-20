import bcrypt from "bcryptjs";
import User from "../../models/userModel";
import { CustomError } from "../../utils/customError";
import { generateToken } from "../../utils/jwtUtils";
import { ObjectId } from "mongodb";

interface UserRegisterInput {
  username: string;
  email: string;
  password: string;
}

interface UserLoginInput {
  email: string;
  password: string;
}

type UserUpdateDataInput =
  | {
      username: string;
    }
  | {
      username?: string;
      oldPassword: string;
      newPassword: string;
    };

class UserAuthServices {
  /**
   * Service for creating a new user.
   *
   * Validates that:
   * - Previous user of the same `email` and `local(authProvider)` doesnt exists
   
   * If validation fails, throws a CustomError with code 409.
   *
   * If Validation succeeds:
   * - Hashes Password
   * - Saves to User Collection
   * 
   * @returns {User} instance of the newly created user.
   */
  static async userRegisterService(data: UserRegisterInput) {
    try {
      const { username, email, password } = data;
      // 1. Check if a user already exists with the same email and local auth
      const existingUser = await User.findOne({
        email: email,
        authProvider: "local",
      });

      if (existingUser) {
        // Throw an error or return a message
        throw new CustomError("User already exists with this email", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 2);
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        authProvider: "local",
      });

      return newUser;
    } catch (err) {
      throw new CustomError(
        `The following unexpected error occurred when trying to register custom user${err}`,
        500
      );
    }
  }

  /**
   * Authenticates a user with email and password for the 'local' auth provider.
   *
   * - Checks if a user exists with the given email and 'local' auth provider.
   * - Verifies the password using bcrypt.
   * - Generates a JWT token upon successful authentication.
   *
   * @param {UserLoginInput} data - An object containing the user's email and password.
   * @param {string} data.email - The email of the user attempting to log in.
   * @param {string} data.password - The password entered by the user.
   *
   * @throws {CustomError} - Throws an error with status 401 if the user is not found or the password is invalid.
   *
   * @returns {Promise<{
   *   token: string;
   *   user: {
   *     id: string;
   *     email: string;
   *     username: string;
   *     authProvider: string;
   *   };
   * }>} An object containing the JWT token and basic user information.
   */
  static async userLoginService(data: UserLoginInput) {
    try {
      const { email, password } = data;
      // Find the user by email and local provider
      const user = await User.findOne({
        email,
        authProvider: "local",
      });

      if (!user) {
        throw new CustomError(
          "User with this email not found for local auth",
          401
        );
      }

      // Compare passwords using bcrypt
      const isPasswordValid = await bcrypt.compare(
        password,
        user.password ?? ""
      );

      // If user authentiation fails return
      if (!isPasswordValid) {
        throw new CustomError("Invalid email or password", 401);
      }

      const token = generateToken({
        id: user._id,
        email: user.email,
        authProvider: user.authProvider,
      });

      return {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          authProvider: user.authProvider,
        },
      };
    } catch (err) {
      throw new CustomError(
        `The following unexpected error occurred when trying login custom user  ${err}`,
        500
      );
    }
  }

  /**
   * Updates user profile data.
   *
   * - Finds the user by ID.
   * - Throws a 404 error if the user does not exist.
   * - If `oldPassword` and `newPassword` are provided:
   *   - Verifies the old password using bcrypt.
   *   - If incorrect, throws a 401 error for invalid password.
   *   - If correct, hashes the new password and updates it.
   * - Updates the `username` if it's different from the current one.
   * - Saves the updated user data in the database.
   *
   * @param {Object} input - Object containing userId and newData.
   * @param {ObjectId} input.userId - The MongoDB ObjectId of the user to be updated.
   * @param {UserUpdateDataInput} input.newData - New data to be updated (username and/or password fields).
   *
   * @throws {CustomError} - 404 if user is not found, 401 if old password is incorrect.
   *
   * @returns {Promise<User>} The updated user document.
   */
  static async userUpdateService({
    userId,
    newData,
  }: {
    userId: ObjectId;
    newData: UserUpdateDataInput;
  }) {
    try {
      // Getting the user
      const user = await User.findById(userId);

      // Returning error if not found
      if (!user || user.authProvider !== "local") {
        throw new CustomError("User not found for local auth.", 404);
      }

      if ("oldPassword" in newData && "oldPassword" in newData) {
        const isPasswordValid = await bcrypt.compare(
          newData.oldPassword,
          user.password ?? ""
        );
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(newData.newPassword, 2);
          user.password = hashedPassword;
        } else {
          throw new CustomError("Invalid Password", 401);
        }
      }

      // updating the username if its available
      if ("username" in newData && newData.username != user.username) {
        user.username = newData.username;
      }

      await user.save();

      return user;
    } catch (err) {
      throw new CustomError(
        `The following unexpected error occurred when trying to update custom user${err}`,
        500
      );
    }
  }
}

export { UserAuthServices };
