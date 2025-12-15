import User from "../models/UsersModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const getAllUsers = catchAsync(async (req, res, next) => {
  console.log("Getting all users.....");
});

export const deleteAllUsers = catchAsync(async (req, res, next) => {
  await User.deleteMany({});

  res.status(200).json({
    status: "success",
    message: "all users deleted...",
  });
});
