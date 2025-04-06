// errorHandler.ts
import { errorConstants } from "../constants";
import { Request, Response, NextFunction } from "express";

const errorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || errorConstants.INTERNAL_SERVER_ERROR;
  res.status(statusCode);
  switch (statusCode) {
    case errorConstants.BAD_REQUEST:
      res.json({
        title: "Bad Request",
        message: err.message,
        errorDetails: err.details,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.UNAUTHORIZED:
      res.json({
        title: "Unauthorized",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.FORBIDDEN:
      res.json({
        title: "Forbidden",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.NOT_FOUND:
      res.json({
        title: "Not Found",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.CONFLICT:
      res.json({
        title: "Conflict",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.UNPROCESSABLE_ENTITY:
      res.json({
        title: "Unprocessable Entity",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.SERVICE_UNAVAILABLE:
      res.json({
        title: "This service is currently unavailable",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.TOO_MANY_REQUESTS:
      res.json({
        title: "Too many reuests",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case errorConstants.INTERNAL_SERVER_ERROR:
    default:
      res.json({
        title: "Internal Server Error has occurred",
        message: err.message,
        errorDetails: err.details,
        stackTrace: err.stack,
      });
      break;
  }
};

// ES6 export
export { errorHandlerMiddleware };
