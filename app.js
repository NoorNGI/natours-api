import dotenv from "dotenv";
dotenv.config();

import express from "express";
import toursRouter from "./routes/toursRouter.js";
import usersRouter from "./routes/usersRouter.js";
import morgan from "morgan";
import qs from "qs";
import { APIError } from "./utils/apiError.js";
import { errorController } from "./controllers/errorController.js";

const app = express();

// const router = express.Router();

// router.param('id', checkId)

// third party middleWares

app.use(express.urlencoded({ extended: true }));

// Replace the default query parser
app.set("query parser", (str) => qs.parse(str));

// to serve static files...
app.use(express.json());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// custom middleware...
app.use((req, res, next) => {
  const requestedTime = new Date().toISOString();

  req.requestedTime = requestedTime;
  next();
});

// serving static files present in public folder on browser route "/static"
app.use("/static", express.static(`./public`));

// Routes
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", usersRouter);

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `Can't find ${req.originalUrl} on this server!`,
  // });

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = "failed";

  next(new APIError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error controller...
app.use(errorController);

console.log(process.env.NODE_ENV, "node env...");

export default app;
