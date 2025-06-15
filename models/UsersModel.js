import { model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please tell your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minLength: [8, "Password must be at lease 8 characters long"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // this only works on SAVE!
      validator: function (value) {
        return value === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
});

userSchema.pre("save", async function (next) {
  // this function will only run when password is modified.
  if (!this.isModified("password")) return next();

  // ENCRYPT/HASH the password, (--> using bcrypt library)
  /**
   * bcrypt library first adds a SALT (adding a random string) to the password and then HASH / ENCRYPT it, so two same passwords never makes the same hash.
   */

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// instance methods (will have access to the current document)...
userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword
) {
  // this.password will not work because we added select property to false in the schema.
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = model("User", userSchema);

export default User;
