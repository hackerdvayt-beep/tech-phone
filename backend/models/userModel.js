import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "Việt Nam",
    },
    birthDate: {
      type: Date,
    },
    phone: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    emailVerificationCode: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre(
  "save",
  // Make sure user password hashed before saving to the database.
  async function (next) {
    if (!this.isModified("password")) {
      // If the password hasn't changed, skip hashing to avoid double-hashing.
      return next();
    }

    const salt = await bcrypt.genSalt(10);
    // Hash the password with a salt for security before saving.
    this.password = await bcrypt.hash(this.password, salt);
    next();
  }
);
const User = mongoose.model("User", userSchema);

export default User;
