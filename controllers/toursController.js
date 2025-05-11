import fs from "fs";

const tours = JSON.parse(
  fs.readFileSync("./dev-data/data/tours-simple.json", "utf-8", (err) => {
    console.log(err, "error");
  })
);

export const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedTime: req.requestedTime,
    data: tours,
  });
};

export const createNewTour = (req, res) => {
  const { id } = req.params;

  console.log(id);
  res.status(200).json({
    status: "success",
    data: tours,
  });
};
