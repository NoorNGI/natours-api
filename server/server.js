import dotenv from "dotenv";
import app from "../app.js";
dotenv.config();

console.log(process.env);
console.log(process.env.NODE_ENV);
const PORT = 8000;

app.listen(PORT, (err) => {
  if (err) console.log(err, "💥");
  else console.log("Server listening on port ", PORT);
});
