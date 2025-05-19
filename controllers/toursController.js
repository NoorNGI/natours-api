import fs from "fs";
import Tour from "../models/ToursModel.js";

const tours = JSON.parse(
  fs.readFileSync("./dev-data/data/tours-simple.json", "utf-8", (err) => {
    console.log(err, "error");
  })
);

export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: "success",
      requestedTime: req.requestedTime,
      data: tours,
    });
  } catch (err) {
    res.status(404).json({
      status: "failed",
      message: err,
    });
  }
};

export const createNewTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

export const getTour = async (req, res) => {
  const { id: tourId } = req.params;

  try {
    // Tour.findOne({{_id: req.params.id}}).. --> same as that,
    const tour = await Tour.findById(tourId); // --> mongoose shorthand..

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

export const updateTour = async (req, res) => {
  const { id: tourId } = req.params;

  try {
    const tour = await Tour.findByIdAndUpdate(tourId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "success",
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

export const deleteTour = async (req, res) => {
  const { id: tourId } = req.params;

  try {
    await Tour.findByIdAndDelete(tourId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};
