import User from "../../models/userModel";
import { CustomError } from "../../utils/customError";
import { generateToken } from "../../utils/jwtUtils";
import { firebaseAdminAuth } from "../../config/firebaseAdmin";

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
    const decoded = await firebaseAdminAuth.verifyIdToken(firebaseToken);

    console.log("[🪪 Decoded Firebase Token]:", decoded);

    const firebaseUid = decoded.uid;
    const email = decoded.email ?? `${firebaseUid}@noemail.com`;

    const rawAuthProvider = decoded.firebase.sign_in_provider;
    let authProvider: "google" | "github";

    if (rawAuthProvider === "google.com") {
      authProvider = "google";
    } else if (rawAuthProvider === "github.com") {
      authProvider = "github";
    } else {
      throw new CustomError("Unsupported auth provider", 400);
    }

    let user = await User.findOne({ firebaseUid });

    if (!user) {
      try {
        user = await User.create({
          email,
          authProvider,
          firebaseUid,
          username: decoded.name ?? "User",
        });
      } catch (error) {
        throw new CustomError(
          `The following error occurred while trying to create user with firebase: ${error}`,
          500
        );
      }
    }
    if (user && !user.username && decoded.name) {
      user.username = decoded.name;
      await user.save();
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
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (err: any) {
    // If the error is already a CustomE  rror, rethrow it
    if (err instanceof CustomError) {
      throw err;
    }

    throw new CustomError(
      `The following unexpected error occurred when trying to login firebase user${err}`,
      500
    );
  }
};
