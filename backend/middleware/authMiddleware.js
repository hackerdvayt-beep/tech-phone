// Somehow this middleware fixed after a restart, respect it
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      authorization.slice("Bearer ".length),
      process.env.JWT_SECRET
    );
  } catch {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }

  const user = await User.findById(decoded.id).select("-password");
  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  req.user = user;
  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

export { protect, admin };
