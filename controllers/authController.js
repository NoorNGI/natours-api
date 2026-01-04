import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/UsersModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIError } from "../utils/apiError.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

// Helper function to sign and sent JWT Token...
const sendToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const verifyToken = async (JWTToken) =>
  await promisify(jwt.verify)(JWTToken, process.env.JWT_SECRET);

const createSendToken = (user, statusCode, res) => {
  const token = sendToken({ id: user._id });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Controller for signing up and immediately logging in the user...
export const signup = catchAsync(async (req, res, next) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };
  const newUser = await User.create(payload);

  createSendToken(newUser, 201, res);

  // const token = sendToken({ id: newUser._id });

  // res.status(200).json({
  //   status: "success",
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

// Controller for logging in users...
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password actually present in body...
  if (!email || !password)
    return next(new APIError("Please provide an email and password", 400));

  // 2) Check if user exist and password is correct..
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new APIError("Incorrect email or password", 401));

  // 3) If everything ok send the JWT token to client...
  createSendToken(user, 200, res);
});

// Controller for protected routes to check the authentication of user before performing any action....
export const protect = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1). Getting token and check if it's there...
  let token;
  if (authHeader && authHeader.startsWith("Bearer"))
    token = authHeader.split(" ")[1];

  if (!token)
    return next(
      new APIError("You are not logged in! Please log in to get access.", 401)
    );

  // 2). Validate token (verification of the token)...
  const decoded = await verifyToken(token);

  // 3). Check if user exists...
  const { id } = decoded;
  const user = await User.findById(id);

  if (!user)
    return next(
      new APIError("The user belonging to the token does no longer exist.", 401)
    );

  // 4). If user change password after the TOKEN issued...
  const isPasswordChangedAfterToken = user.passwordChangedAfter(decoded.iat);

  if (isPasswordChangedAfterToken)
    return next(
      new APIError(
        "User changed the password recently. Please log in again!",
        401
      )
    );

  // GRANT ACCESS TO PROTECTED ROUTES...
  req.user = user;
  next();
});

// Controller to check the authorization of the user based on the roles...
export const restrictTo =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!allowedRoles.includes(req.user.role))
      return next(
        new APIError("You do not have permission to perform this action", 403)
      );

    next();
  };

// Controller to forgot password...
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1). check if email is provided and user against the email exist...
  if (!req.body.email)
    return next(new APIError("Please provide an email.", 400));

  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new APIError("No user found against the given email.", 404));

  //2). create a reset token... (create instance method)
  const resetToken = user.createResetPasswordToken();
  // save the doc immediately
  await user.save({ validateBeforeSave: false });

  //3). send the reset token to user provided email...
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  // if there is an error sending the email, then the resetpassword token and resetpassword expires fields should be reverted in DB.
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new APIError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email!",
  });
});

// Controller to reset password...
export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, passwordConfirm } = req.body;

  // 1). get user based on the token...
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    // if reset expires is less than current time, then the token is expired, no user will return.
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // 2). If token is not expired, and there is user, set new password...
  if (!user) return next(new APIError("Token is invalid or expired", 400));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // have to run the validations...
  await user.save();

  // 3). Update changedPasswordAt property of the user...
  // 4). Log the user in, send JWT...
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { passwordOld, passwordNew, passwordConfirm } = req.body;

  // 1). Get user from the collection...
  const user = await User.findById(req.user._id).select("+password");

  // 2). Check if posted current password is correct...
  if (!(await user.checkPassword(passwordOld, user.password)))
    return next(new APIError("Your current password is wrong", 401));

  // 3). If so, update the password...
  user.password = passwordNew;
  user.passwordConfirm = passwordConfirm;
  user.passwordChangedAt = Date.now() - 1000;

  await user.save();

  // 4). Log user in, send JWT...
  createSendToken(user, 200, res);
});
