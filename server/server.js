import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import app from "../app.js";

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

console.log(DB, "db..");
mongoose.connect(DB).then((con) => {
  console.log(con, "---con");
  console.log("DB connection successful");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err, "💥");
  else console.log("Server listening on port ", PORT);
});
