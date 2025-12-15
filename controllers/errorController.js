import { APIError } from "../utils/apiError.js";

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APIError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err?.errorResponse?.errmsg.match(/\{([^}]+)\}/)[0];
  const message = `Duplicate field name --> ${value}`;

  return new APIError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((obj) => obj?.properties?.message)
    .join(", ");

  const message = `Validation Error: ${errors}`;

  return new APIError(message, 400);
};

const handleJWTError = (err) =>
  new APIError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = (err) =>
  new APIError("Your token is expired. Please log in again!", 401);

// ================ X X X X X X X X X =======================//

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

// ================ X X X X X X X X X =======================//

export const errorController = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    // invalid database ID's
    if (error?.kind === "ObjectId") error = handleCastErrorDB(error);
    // duplicate fields error
    if (error?.code === 11000) error = handleDuplicateFieldsDB(error);
    // mongoose validation errors
    if (error?._message?.includes("validation failed"))
      error = handleValidationErrorDB(error);
    if (error?.name === "JsonWebTokenError") error = handleJWTError(error);
    if (error?.name === "TokenExpiredError")
      error = handleJWTExpiredError(error);

    sendErrorProd(error, res);
  }
};
