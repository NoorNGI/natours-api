import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "../app.js";

// connection to database...
const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB Connection successful.. ✅");
  })
  .catch((err) => {
    console.log("DB Connection failed.. 💥");
    console.log(err);
  });

// starting the server...
const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err, "💥");
  else console.log("Server listening on port ", PORT);
});
