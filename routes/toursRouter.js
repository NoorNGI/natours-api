import express from "express";
import {
  createNewTour,
  deleteTour,
  getAllTours,
  getTour,
  updateTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} from "../controllers/toursController.js";

const router = express.Router();

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/").get(getAllTours).post(createNewTour);

router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

export default router;
