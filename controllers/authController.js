import jwt from "jsonwebtoken";
import User from "../models/UsersModel.js";
import { catchAsync } from "../utils/catchAsync.js";

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

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});
