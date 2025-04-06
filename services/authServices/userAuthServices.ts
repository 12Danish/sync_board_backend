import bcrypt from "bcryptjs";
import User from "../../models/userModel";
import { CustomError } from "../../utils/CustomError";

export interface UserRegisterInput {
  username: string;
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

  static async userLoginService() {}

  static async userGetService() {}

  static async userUpdateService() {}
}

export { UserAuthServices };
