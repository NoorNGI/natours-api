import express from "express";
import {
  createNewTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
} from "../controllers/toursController.js";

const router = express.Router();

router.route("/").get(getAllTours).post(createNewTour);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

export default router;
