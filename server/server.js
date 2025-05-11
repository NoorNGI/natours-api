import app from "../app.js";

const PORT = 8000;

app.listen(PORT, (err) => {
  if (err) console.log(err, "💥");
  else console.log("Server listening on port ", PORT);
});
