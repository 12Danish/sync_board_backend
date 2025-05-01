import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";
import { body, validationResult } from "express-validator";

class BoardMiddleware {
  /**
   * Middleware for validating board creation input fields.
   *
   * Validates that:
   * - `name` is not empty after trimming.
   * - `security` is not empty and must be either 'private' or 'public'.
   * - `collaborators` is optional but must be an array if provided.
   * - No additional fields apart from `name`, `security`, and `collaborators` are present.
   *
   * If validation fails or unexpected fields are included, throws a CustomError with details.
   *
   * @returns Express middleware array for board creation input validation.
   */
  static validateBoardCreateInput() {
    return [
      body("name").trim().notEmpty().withMessage("Board name is needed"),
      body("security")
        .trim()
        .notEmpty()
        .withMessage("Security level i.e private or public needs to be defined")
        .isIn(["private", "public"])
        .withMessage("Security must be either 'private' or 'public'"),
      body("collaborators")
        .optional()
        .isArray()
        .withMessage("Collaborators must be an array"),

      // Custom middleware to check for extra fields
      (req: Request, res: Response, next: NextFunction) => {
        const allowedFields = ["name", "security", "collaborators"];
        const extraFields = Object.keys(req.body).filter(
          (key) => !allowedFields.includes(key)
        );

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          const error = new CustomError(
            "Error with the input received",
            400,
            errors.array()
          );
          return next(error);
        }

        if (extraFields.length > 0) {
          const error = new CustomError(
            `Unexpected fields in input: ${extraFields.join(", ")}`,
            400
          );
          return next(error);
        }

        next();
      },
    ];
  }

  /**
   * Middleware for validating the presence of a board ID in the request parameters.
   *
   * Validates that:
   * - The `id` parameter exists in the URL (i.e., `req.params["id"]`).
   *
   * If the `id` parameter is missing, a `CustomError` is thrown with a `400` status code and a message
   * indicating that the "Board id is needed".
   *
   * If the `id` parameter is present, the request proceeds to the next middleware or route handler.
   *
   * @returns Express middleware array for checking if the `id` parameter exists in the request URL.
   */
  static checkIdInParam() {
    return [
      (req: Request, res: Response, next: NextFunction) => {
        if (!req.params["id"]) {
          const error = new CustomError("Board id is needed", 400);
          return next(error);
        }

        next();
      },
    ];
  }

  /**
   * Middleware for validating the presence of a `name` query parameter in the request URL.
   *
   * Validates that:
   * - The `name` query parameter exists in the URL (i.e., `req.query["name"]`).
   *
   * If the `name` query parameter is missing, a `CustomError` is thrown with a `400` status code and a message
   * indicating that the "`name` query parameter for the board" must be included.
   *
   * If the `name` parameter is present, the request proceeds to the next middleware or route handler.
   *
   * @returns Express middleware array for checking if the `name` query parameter exists in the request URL.
   */
  static checkNameInQueryParam() {
    return [
      (req: Request, res: Response, next: NextFunction) => {
        const name = req.query.name;
        if (!name || (typeof name === "string" && name.trim() === "")) {
          return next(
            new CustomError(
              "Please include a non-empty `name` query parameter for the board",
              400
            )
          );
        }
        next();
      },
    ];
  }

  /**
   * Middleware for validating the request body when adding a collaborator to a board.
   *
   * Validates that:
   * - `targetUserId` is present and not empty in the request body.
   *
   * If validation fails, a `CustomError` is thrown with a `400` status code, and an array of validation errors is included.
   * If validation passes, the request proceeds to the next middleware or route handler.
   *
   * @returns Express middleware array for validating `targetUserId` and `permission` in the request body.
   */

  static checkUserIdInBody() {
    return [
      body("targetUserId")
        .trim()
        .notEmpty()
        .withMessage("Target User id is needed"),

      (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          const error = new CustomError(
            "Error with the input received",
            400,
            errors.array()
          );
          return next(error);
        }
        next();
      },
    ];
  }

   /**
   * Middleware for validating the request body when adding a collaborator to a board.
   *
   * Validates that:
   * - `permission` is present and not empty in the request body.
   *
   * If validation fails, a `CustomError` is thrown with a `400` status code, and an array of validation errors is included.
   * If validation passes, the request proceeds to the next middleware or route handler.
   *
   * @returns Express middleware array for validating `targetUserId` and `permission` in the request body.
   */
  static checkPermissionInBody() {
    return [
      body("permission")
        .trim()
        .notEmpty()
        .withMessage("Collaborator permission must be set")
        .isIn(["edit", "view"])
        .withMessage("Permission must be either 'edit' or 'view'"),
      (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          const error = new CustomError(
            "Error with the input received",
            400,
            errors.array()
          );
          return next(error);
        }
        next();
      },
    ];
  }
}

export { BoardMiddleware };
