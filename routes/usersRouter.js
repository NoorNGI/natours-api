import express from "express";
import {
  deleteAllUsers,
  deleteMe,
  getAllUsers,
  updateMe,
} from "../controllers/usersController.js";
import {
  forgotPassword,
  login,
  protect,
  resetPassword,
  signup,
  updatePassword,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/updateMyPassword", protect, updatePassword);
router.patch("/updateMe", protect, updateMe);
router.patch("/deleteMe", protect, deleteMe);

router.route("/").get(getAllUsers);
router.post("/deleteAll", deleteAllUsers);

export default router;
