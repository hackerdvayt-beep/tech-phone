import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

const createEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const createVerificationCode = () =>
  crypto.randomInt(100000, 1000000).toString();

const sendVerificationEmail = async (email, code) => {
  const transporter = createEmailTransporter();
  if (!transporter) {
    throw new Error(
      "Chưa cấu hình Gmail gửi email. Cần EMAIL_USER và EMAIL_APP_PASSWORD"
    );
  }

  await transporter.sendMail({
    from: `"TECH PHONE" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Mã xác nhận đăng ký TECH PHONE",
    text: `Mã xác nhận của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
    html: `<p>Mã xác nhận đăng ký <strong>TECH PHONE</strong>:</p><h2>${code}</h2><p>Mã có hiệu lực trong 10 phút.</p>`,
  });
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email?.trim().toLowerCase() });

  if (user && (await user.matchPassword(password))) {
    if (!user.isAdmin && !user.isEmailVerified) {
      res.status(403);
      throw new Error("Vui lòng xác nhận Gmail bằng mã đã gửi");
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, country, birthDate, phone } = req.body;

  if (!email || !email.trim().toLowerCase().endsWith("@gmail.com")) {
    res.status(400);
    throw new Error("Vui lòng dùng địa chỉ Gmail kết thúc bằng @gmail.com");
  }

  if (!password || password.length < 8) {
    res.status(400);
    throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
  }
  if (!/[0-9]/.test(password)) {
    res.status(400);
    throw new Error("Mật khẩu phải có ít nhất 1 chữ số");
  }
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]/.test(password)) {
    res.status(400);
    throw new Error("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
  }

  const phoneDigits = String(phone || "").replace(/\D/g, "");
  if (phoneDigits.length < 8 || phoneDigits.length > 15) {
    res.status(400);
    throw new Error("Số điện thoại phải có từ 8 đến 15 chữ số");
  }

  if (birthDate && Number.isNaN(new Date(birthDate).getTime())) {
    res.status(400);
    throw new Error("Ngày sinh không hợp lệ");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const code = createVerificationCode();

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    country: country || "Việt Nam",
    birthDate: birthDate ? new Date(birthDate) : undefined,
    phone: phone.trim(),
    isEmailVerified: false,
    emailVerificationCode: code,
    emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  if (user) {
    try {
      await sendVerificationEmail(normalizedEmail, code);
      res.status(201).json({
        message: "Tài khoản đã được tạo. Mã xác nhận đã được gửi đến Gmail.",
        email: normalizedEmail,
        requiresVerification: true,
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      res.status(500);
      throw error;
    }
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email?.trim().toLowerCase();
  const otp = req.body.otp?.trim();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationCode +emailVerificationExpires"
  );
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản");
  }
  if (user.isEmailVerified) {
    res.json({ message: "Email đã được xác nhận", verified: true });
    return;
  }
  if (
    !user.emailVerificationExpires ||
    user.emailVerificationExpires.getTime() < Date.now()
  ) {
    res.status(400);
    throw new Error("Mã xác nhận đã hết hạn");
  }
  if (String(user.emailVerificationCode) !== String(otp)) {
    res.status(400);
    throw new Error("Mã xác nhận không chính xác");
  }

  user.isEmailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.json({
    message: "Xác nhận Gmail thành công",
    verified: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
  const normalizedEmail = req.body.email?.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.endsWith("@gmail.com")) {
    res.status(400);
    throw new Error("Vui lòng dùng địa chỉ Gmail hợp lệ");
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+emailVerificationCode +emailVerificationExpires"
  );
  if (!user) {
    res.status(404);
    throw new Error("Không tìm thấy tài khoản");
  }
  if (user.isEmailVerified) {
    res.json({ message: "Email đã được xác nhận" });
    return;
  }

  const code = createVerificationCode();
  user.emailVerificationCode = code;
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();
  await sendVerificationEmail(normalizedEmail, code);
  res.json({ message: "Đã gửi lại mã xác nhận" });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      const password = req.body.password;
      if (password.length < 8) {
        res.status(400);
        throw new Error("Mật khẩu phải có ít nhất 8 ký tự");
      }
      if (!/[0-9]/.test(password)) {
        res.status(400);
        throw new Error("Mật khẩu phải có ít nhất 1 chữ số");
      }
      if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]/.test(password)) {
        res.status(400);
        throw new Error("Mật khẩu phải có ít nhất 1 ký tự đặc biệt");
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user with cascade delete
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error("Cannot delete your own account");
    }

    // Cascade delete: Remove all orders associated with this user
    await Order.deleteMany({ user: req.params.id });

    // Cascade delete: Remove all product reviews by this user
    await Product.updateMany(
      { "reviews.user": req.params.id },
      { $pull: { reviews: { user: req.params.id } } }
    );

    // Update products to recalculate rating and numReviews after review deletion
    const productsWithDeletedReviews = await Product.find({
      "reviews.user": { $exists: true },
    });

    for (const product of productsWithDeletedReviews) {
      if (product.reviews.length > 0) {
        product.numReviews = product.reviews.length;
        product.rating =
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length;
      } else {
        product.numReviews = 0;
        product.rating = 0;
      }
      await product.save();
    }

    // Finally, delete the user
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User and all associated data removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  authUser,
  registerUser,
  verifyEmail,
  resendVerificationEmail,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
};
