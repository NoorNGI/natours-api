import express from "express";
import { deleteAllUsers, getAllUsers } from "../controllers/usersController.js";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.route("/").get(getAllUsers);
router.post("/deleteAll", deleteAllUsers);

export default router;
