import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "../app.js";

// connection to database...
const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log("DB Connection successful.. ✅");
});

// starting the server...
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, (err) => {
  if (err) console.log(err, "💥");
  else console.log("Server listening on port ", PORT);
});

// Handling unhandled rejections... (global)
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection 💥, shutting down...");

  server.close(() => {
    process.exit(1);
  });
});

// UNCAUGHT EXCEPTIONS, --> (global) --> (programming errors...) // this should be on top level of the code.
// process.on("uncaughtException", (err) => {
//   console.log(err.name, err.message);
//   console.log("Uncaught exception 💥, shutting down...");

//   process.exit(1);
// });
// console.log(x); // x is not defined
