import jwt from "jsonwebtoken";
import User from "../models/UsersModel.js";
import { catchAsync } from "../utils/catchAsync.js";
import { APIError } from "../utils/apiError.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const photo = req.body.photo;
  const password = req.body.password;
  const passwordConfirm = req.body.passwordConfirm;

  const newUser = await User.create({
    name,
    email,
    photo,
    password,
    passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  // 1) Check if email and password are given.
  const { email, password } = req.body;

  if (!email || !password)
    return next(new APIError("Please provide email and password", 400));

  // 2) Check wether user exists or password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(password, user.password)))
    return next(new APIError("Incorrect email or password", 401));

  //3) If everything is ok, then send the token to client

  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

export const protect = catchAsync(async (req, res, next) => {
  next();
});
