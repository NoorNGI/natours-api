import express from "express";
import toursRouter from "./routes/toursRouter.js";
import morgan from "morgan";

const app = express();

// thirdPary middleWares

// to serve static files...
app.use(express.json());

app.use(morgan("dev"));

// custom middleware...
app.use((req, res, next) => {
  const requestedTime = new Date().toISOString();

  req.requestedTime = requestedTime;
  next();
});

// Routes
app.use("/api/v1/tours", toursRouter);
app.use("/api/v1/users", toursRouter);

export default app;
