import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/UsersModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIError } from "../utils/apiError.js";

// Helper function to sign and sent JWT Token...
const sendToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// Controller for signing up and immediately logging in the user...
export const signup = catchAsync(async (req, res, next) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };
  const newUser = await User.create(payload);

  const token = sendToken({ id: newUser._id });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
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
  const token = sendToken({ id: user._id });

  res.status(201).json({
    status: "success",
    token,
  });
});

// Controller for protected routes to check the authorization of user before performing any action....
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
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3). Check if user exists...
  const { id } = decoded;
  const selectedUser = await User.findById(id);

  if (!selectedUser)
    return next(
      new APIError("The user belonging to the token does no longer exist.", 401)
    );

  // 4). If user change password after the TOKEN issued...
  const isPasswordChangedAfterToken = selectedUser.passwordChangedAfter(
    decoded.iat
  );

  if (isPasswordChangedAfterToken)
    return next(
      new APIError(
        "User changed the password recently. Please log in again!",
        401
      )
    );

  // GRANT ACCESS TO PROTECTED ROUTES...
  req.user = selectedUser;
  next();
});
