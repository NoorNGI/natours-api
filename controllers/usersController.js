import User from "../models/UsersModel.js";
import { APIError } from "../utils/apiError.js";
import { catchAsync } from "../utils/catchAsync.js";

const filterObj = (object, ...allowedFields) => {
  const newObj = {};
  Object.keys(object).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = object[el];
  });
  return newObj;
};

export const updateMe = catchAsync(async (req, res, next) => {
  // 1). Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new APIError(
        "This route is not for password updates. Please use /updateMyPassword.",
        400
      )
    );

  // 2). Update user document
  const filteredBody = filterObj(req.body, "name", "email");
  console.log(filteredBody, "filtered body...");
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { updatedUser },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    results: users?.length,
    data: {
      users,
    },
  });
});

export const deleteAllUsers = catchAsync(async (req, res, next) => {
  await User.deleteMany({});

  res.status(200).json({
    status: "success",
    message: "all users deleted...",
  });
});
