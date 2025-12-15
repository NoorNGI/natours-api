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
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router.route("/").get(protect, getAllTours).post(protect, createNewTour);

router
  .route("/:id")
  .get(protect, getTour)
  .patch(protect, updateTour)
  .delete(protect, deleteTour);

export default router;
