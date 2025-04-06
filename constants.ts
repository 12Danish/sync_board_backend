export const errorConstants = {
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INTERNAL_SERVER_ERROR: 500,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  NO_CONTENT: 204,
} as const;

export type ErrorCode = keyof typeof errorConstants; // Type representing keys of errorConstants, like 'NOT_FOUND'
