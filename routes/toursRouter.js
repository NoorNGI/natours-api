import express from "express";
import {
  createNewTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  aliasTopTours,
} from "../controllers/toursController.js";

const router = express.Router();

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/").get(getAllTours).post(createNewTour);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

export default router;
