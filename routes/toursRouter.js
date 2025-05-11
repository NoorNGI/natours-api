import express from "express";
import { createNewTour, getAllTours } from "../controllers/toursController.js";

const router = express.Router();

router.route("/").get(getAllTours).post(createNewTour);

router
  .route("/:id")
  .get((req, res) => console.log("/get-tour-by-id"))
  .patch((req, res) => console.log("/edit a tour by id"))
  .delete((req, res) => console.log("/delete a tour by id"));

export default router;
