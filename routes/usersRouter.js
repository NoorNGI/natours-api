import express from "express";

const router = express.Router();

router
  .route("/")
  .get((req, res) => console.log("/getAllUsers"))
  .post((req, res) => console.log("/createUser"));

router
  .route("/:id")
  .get((req, res) => console.log("/get-user-by-id"))
  .patch((req, res) => console.log("/edit a user by id"))
  .delete((req, res) => console.log("/delete a user by id"));

export default router;
