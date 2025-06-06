import dotenv from "dotenv";
dotenv.config();

import express from "express";
import toursRouter from "./routes/toursRouter.js";
import morgan from "morgan";
import qs from "qs";

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
app.use("/api/v1/users", toursRouter);

export default app;
