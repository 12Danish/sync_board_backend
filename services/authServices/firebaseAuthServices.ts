import { getAuth } from "firebase-admin/auth";
import User from "../../models/userModel";
import { CustomError } from "../../utils/customError";
import { generateToken } from "../../utils/jwtUtils";

/**
 * Logs in a user using a Firebase ID token.
 * This function verifies the provided Firebase ID token using Firebase Admin SDK,
 * extracts the user's email, UID, and sign-in provider, and attempts to find
 * a corresponding user in the local database.
 * If the user does not exist, it creates a new user using the extracted details.
 * Finally, it generates a JWT for the authenticated session and returns it along
 * with basic user details.
 *
 * @param {string} firebaseToken - The Firebase ID token received from the client after sign-in.
 * @returns {Promise<{ token: string, user: { id: string, email: string, authProvider: string } }> }
 * An object containing the JWT token and user information.
 * @throws {CustomError} - Throws an error if token verification fails or if user creation fails.
 */
export const firebaseLoginService = async (firebaseToken: string) => {
  try {
    const decoded = await getAuth().verifyIdToken(firebaseToken);
    const firebaseUid = decoded.uid;
    const authProvider = decoded.firebase.sign_in_provider;
    const email = decoded.email;

    if (authProvider !== "google" && authProvider !== "github") {
      throw new CustomError("Unsupported auth provider", 400);
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      try {
        user = await User.create({
          email,
          authProvider,
          firebaseUid,
        });
      } catch (error) {
        throw new CustomError(
          `The following error occurred while trying to create user with firebase: ${error}`,
          500
        );
      }
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
        authProvider: user.authProvider,
      },
    };
  } catch (err: any) {
    // If the error is already a CustomError, rethrow it
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(
      `The following unexpected error occurred when trying to login firebase user${err}`,
      500
    );
  }
};
