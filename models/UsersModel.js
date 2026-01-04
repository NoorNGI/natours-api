import bcrypt from "bcryptjs";
import crypto from "crypto";
import { model, Schema } from "mongoose";
import validator from "validator";

const usersSchema = new Schema({
  name: {
    type: String,
    required: [true, "User name is required"],
  },
  email: {
    type: String,
    required: [true, "User email is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "admin", "guide", "lead-guide"],
      message: "Invalid user role",
    },
    default: "user",
  },
  photo: String,
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on (SAVE and CREATE, X UPDATE)
      validator: function (el) {
        return el === this.password;
      }, // if true (validation passed)
      message: "Password are not the same",
    },
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// ---------------- MIDDLEWARES ------------------- //

usersSchema.pre("save", async function (next) {
  // Only runs if the password field is modified...
  if (!this.isModified("password")) return next();

  // encrypt the password with bcrypt.js hash function asynchronously...
  // synchronous fn --> hashAsync()...
  // 12 is the salt value, to cryptographically encrypt the password by shifting the bytes...
  this.password = await bcrypt.hash(this.password, 12);

  // delete the passwordConfirm field, basically not be persisted in the DB...
  this.passwordConfirm = undefined;
  next();
});

usersSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

usersSchema.pre(/^find/, function (next) {
  // this keyword refers to the current query...
  this.find({ active: { $ne: false } });

  next();
});

// ----------------------------------------------- //

// ------------ INSTANCE METHODS ----------------- //.

// method to check if the hashed password in DB and password given from user in REQ are same or not...
usersSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  // candidatePassword --> password coming from request.
  // userPassword --> real hashed password stored in the DB.
  return bcrypt.compare(candidatePassword, userPassword);
};

// method to confirm that wether the password is changed after the issuance of token or not...
usersSchema.methods.passwordChangedAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < changedTimeStamp;
  }

  return false;
};

usersSchema.methods.createResetPasswordToken = function () {
  // generate a random string reset token.
  const resetToken = crypto.randomBytes(32).toString("hex");

  // update the db field with hashed reset token.
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // update the db field with expiry date for the reset token.
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min.

  // NOTE: this will not save the document in db automatically we have to save the document manually by running the .save() method from mongoose...

  // return the reset token, (not encrypted one)
  return resetToken;
};

// ------------------------------------------------ //

const User = model("User", usersSchema);

export default User;
