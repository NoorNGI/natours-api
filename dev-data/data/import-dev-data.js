import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Tour from "../../models/ToursModel.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));

const importData = async () => {
  try {
    await Tour.create(tours);
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany();
  } catch (err) {
    console.log(err);
  }

  process.exit();
};

if (process.argv[2] === "--import") importData();
if (process.argv[2] === "--delete") deleteData();
