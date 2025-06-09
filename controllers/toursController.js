import fs from "fs";
import Tour from "../models/ToursModel.js";
import { APIFeatures } from "../utils/apiFeatures.js";

// const tours = JSON.parse(
//   fs.readFileSync("./dev-data/data/tours-simple.json", "utf-8", (err) => {
//     console.log(err, "error");
//   })
// );

export const aliasTopTours = async (req, res, next) => {
  // req.query.limit = "5";
  // req.query.sort = "-ratingsAverage,price";
  // req.query.fields = "name,price,ratingsAverage,summary,difficulty";

  req.url +=
    "?limit=5&sort=-ratingsAverage,price&fields=name,price,ratingsAverage,summary,difficulty";

  next();
};

export const getAllTours = async (req, res) => {
  try {
    // ---------- BUILDING UP THE QUERY ----------------
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;

    res.status(200).json({
      status: "success",
      requestedTime: req.requestedTime,
      results: tours?.length,
      data: {
        tours,
      },
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

export const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          // _id: { $toUpper: "$ratingsAverage" },
          _id: { $toUpper: "$difficulty" },
          numTours: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: "EASY" } },
      // },
    ]);

    res.status(200).json({
      status: "success",
      data: { stats },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

export const getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        // date should be between 1st day and last day of the year.
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // 1st day of the year.
            $lte: new Date(`${year}-12-31`), // last day of the year.
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numToursStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numToursStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: "success",
      results: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

/////////// OLD ///////////////

// export const getAllTours = async (req, res) => {
//   // const queryStr = JSON.parse(req.query).console.log(req.query);
//   console.log(req.query);
//   try {
//     // ---------- BUILDING UP THE QUERY ----------------
//     let query;
//     const queryObj = { ...req.query };

//     // 1a) BASIC FILTERING...
//     const excludedFields = ["page", "limit", "sort", "fields"];
//     excludedFields.forEach((el) => delete queryObj[el]);

//     // 1b) ADVANCE FILTERING...

//     // ?sort=price&difficulty[gte]=easy --> query params...
//     // { sort: 'price', difficulty: { gte: 'easy' } } --> getting this
//     // { sort: 'price', difficulty: { $gte: 'easy' } } --> want this

//     let queryString = JSON.stringify(queryObj);
//     queryString = queryString.replace(
//       /\b(gt|gte|lt|lte)\b/g,
//       (match) => `$${match}`
//     );

//     query = Tour.find(JSON.parse(queryString));

//     // 2) SORTING
//     // ?sort=price,-duration...
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);

//       // query.sort('price -ratingsAverage')
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // 2) FIELDS LIMITING
//     // ?fields=name,price,-duration
//     if (req.query.fields) {
//       const fields = req.query.fields.split(",").join(" ");
//       query = query.select(fields);
//     } else {
//       query = query.select("-__v");
//     }

//     // 4) PAGINATION
//     // ?page=2&limit=10 --> 1-10, 11-20, 21-30
//     const page = req.query.page * 1 || 1;
//     const limit = req.query.limit * 1 || 100;
//     const skip = (page - 1) * limit;

//     query = query.skip(skip).limit(limit);

//     if (req.query.page) {
//       const numOfTours = await Tour.countDocuments();
//       if (skip >= numOfTours) throw new Error("This page does not exist.");
//     }

//     // ---------- CONSUMING UP THE QUERY ----------------

//     // const tours = await Tour.find({
//     //   duration: 5,
//     //   price: { $gte: 500 },
//     //   difficulty: "easy",
//     // });

//     // const tours = await Tour.find()
//     //   .where("difficulty")
//     //   .equals("easy")
//     //   .where("duration")
//     //   .equals(5)
//     //   .where("price")
//     //   .gte(500);

//     // --------------------- BOTH ARE SAME IN MONGOOSE ---------------------- //

//     const tours = await query;

//     res.status(200).json({
//       status: "success",
//       requestedTime: req.requestedTime,
//       totalRecords: tours?.length,
//       data: tours,
//     });
//   } catch (err) {
//     res.status(404).json({
//       status: "failed",
//       message: err,
//     });
//   }
// };
