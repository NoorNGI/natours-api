import { model, Schema } from "mongoose";
import slugify from "slugify";

const toursSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxLength: [40, "Tour name must have lesser or equal to 40 characters"],
      minLength: [10, "Tour name must have greater or equal to 10 characters"],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty should be either: easy, medium or difficult",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      // In ths custom validator, this keyword will point on the current doc on NEW document creation, and will not work on updating a document.
      validate: {
        validator: function (value) {
          // value is the current value of the field...
          return value < this.price; // validation activates when false is returned.
        },
        message: "Discount Price ({VALUE}) must below the regular price",
      },
    },
    summary: {
      type: String,
      required: [true, "A tour must have a description"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now(),
    // },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// virtual properties are the field we define in the schema, but they are never persisted in the database, like conversion of distance from m to km etc...
// to make it work we have do one change in the schema as well (in the options object. ).

toursSchema.virtual("durationWeeks").get(function () {
  // if we want to use the this keyword then should avoid arrow function here...
  return Math.floor(this.duration / 7);
});

// Mongo DB Middlewares
/**
 * 1) DOCUMENT MIDDLEWARE
 * 2) QUERY MIDDLEWARE
 * 3) AGGREGATION MIDDLEWARE
 * 4) MODEL LEVEL MIDDLEWARE
 *
 * PRE middleware runs before the specific event.
 * POST middleware runs after the specific event.
 */

// ============ DOCUMENT MIDDLEWARE (save, create) ========== //
toursSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// toursSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });
// ---------------------------------------------------------//

// ============ QUERY MIDDLEWARE ========== //
toursSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  // this.start = new Date();
  next();
});

// toursSchema.post(/^find/, function (docs, next) {
//   console.log(`This Query took ${new Date() - this.start} milliseconds.`);
//   next();
// });
// ---------------------------------------------------------//

// ============ AGGREGATION MIDDLEWARE ========== //
toursSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  // console.log(this.pipeline());
  next();
});

const Tour = model("Tour", toursSchema);

export default Tour;
