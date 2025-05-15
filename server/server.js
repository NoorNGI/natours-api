import dotenv from "dotenv";
dotenv.config();

import app from "../app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) console.log(err, "💥");
  else console.log("Server listening on port ", PORT);
});
