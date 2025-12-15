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
import { protect, restrictTo } from "../controllers/authController.js";

const router = express.Router();

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);

router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);

router
  .route("/")
  .get(protect, getAllTours)
  .post(protect, restrictTo("lead-guide", "admin"), createNewTour);

router
  .route("/:id")
  .get(protect, getTour)
  .patch(protect, restrictTo("lead-guide", "admin"), updateTour)
  .delete(protect, restrictTo("lead-guide", "admin"), deleteTour);

export default router;
