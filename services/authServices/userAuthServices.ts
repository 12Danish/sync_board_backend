import bcrypt from "bcryptjs";
import User from "../../models/userModel";
import { CustomError } from "../../utils/customError";
import { generateToken } from "../../utils/jwtUtils";
import { ObjectId } from "mongodb";

export interface UserRegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}
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
    const { email, password } = data;
    // Find the user by email and local provider
    const user = await User.findOne({
      email,
      authProvider: "local",
    });

    if (!user) {
      throw new CustomError("User with this email not found", 401);
    }

    // Compare passwords using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password ?? "");

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
  }

  static async userGetService(user_id: ObjectId) {
    try {
      const user = User.findById(user_id).select("username email");

      if (!user) {
        throw new CustomError("User not found", 404);
      }
      return user;
    } catch (error) {}
  }

  static async userUpdateService() {}
}

export { UserAuthServices };
