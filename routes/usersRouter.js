import express from "express";
import { login, signup } from "../controllers/authController.js";

const router = express.Router();

// auth operations routes, (signup, signin)
router.post("/signup", signup);
router.post("/login", login);

// other routes
// router
//   .route("/")
//   .get((req, res) => console.log("/getAllUsers"))
//   .post();

// router
//   .route("/:id")
//   .get((req, res) => console.log("/get-user-by-id"))
//   .patch((req, res) => console.log("/edit a user by id"))
//   .delete((req, res) => console.log("/delete a user by id"));

export default router;
