import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import InstallmentRequest, {
  INSTALLMENT_REQUEST_STATUSES,
} from "../models/installmentRequestModel.js";
import { priceInstallmentCart } from "../utils/installmentPricing.js";

const createInstallmentRequest = asyncHandler(async (req, res) => {
  const {
    applicantName,
    phone,
    downPaymentPercent,
    termMonths,
    cartItems,
  } = req.body;
  const normalizedName = String(applicantName || "").trim();
  const normalizedPhone = String(phone || "").replace(/\D/g, "");
  const downPayment = Number(downPaymentPercent);
  const term = Number(termMonths);

  if (normalizedName.length < 2 || normalizedName.length > 100) {
    res.status(400);
    throw new Error("Họ tên phải có từ 2 đến 100 ký tự");
  }

  if (normalizedPhone.length < 9 || normalizedPhone.length > 12) {
    res.status(400);
    throw new Error("Số điện thoại không hợp lệ");
  }

  if (![30, 50, 70].includes(downPayment)) {
    res.status(400);
    throw new Error("Phần trăm trả trước không hợp lệ");
  }

  if (![6, 9, 12].includes(term)) {
    res.status(400);
    throw new Error("Kỳ hạn trả góp không hợp lệ");
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0 || cartItems.length > 50) {
    res.status(400);
    throw new Error("Giỏ hàng không hợp lệ");
  }

  if (
    cartItems.some(
      (item) =>
        !item ||
        !mongoose.Types.ObjectId.isValid(item.product) ||
        !Number.isInteger(Number(item.qty)) ||
        Number(item.qty) < 1
    )
  ) {
    res.status(400);
    throw new Error("Thông tin sản phẩm trong giỏ hàng không hợp lệ");
  }

  const productIds = [...new Set(cartItems.map((item) => String(item.product)))];
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
  });
  const productsById = new Map(
    products.map((product) => [String(product._id), product])
  );

  let quote;
  try {
    quote = priceInstallmentCart(cartItems, productsById);
  } catch (error) {
    res.status(error.statusCode || 400);
    throw error;
  }

  const shippingPrice = quote.itemsPrice > 100 ? 0 : 100;
  const taxPrice = Number((quote.itemsPrice * 0.15).toFixed(2));
  const orderTotal = Number(
    (quote.itemsPrice + shippingPrice + taxPrice).toFixed(2)
  );
  const downPaymentAmount = Math.round((orderTotal * downPayment) / 100);
  const monthlyPayment = Math.ceil(
    (orderTotal - downPaymentAmount) / term
  );

  const request = await InstallmentRequest.create({
    user: req.user._id,
    applicantName: normalizedName,
    phone: normalizedPhone,
    downPaymentPercent: downPayment,
    termMonths: term,
    items: quote.items,
    itemsPrice: quote.itemsPrice,
    shippingPrice,
    taxPrice,
    orderTotal,
    downPaymentAmount,
    monthlyPayment,
  });

  res.status(201).json(request);
});

const listInstallmentRequests = asyncHandler(async (req, res) => {
  const requests = await InstallmentRequest.find({})
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(requests);
});

const updateInstallmentRequestStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || "");
  if (!INSTALLMENT_REQUEST_STATUSES.includes(status)) {
    res.status(400);
    throw new Error("Trạng thái yêu cầu trả góp không hợp lệ");
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Mã yêu cầu trả góp không hợp lệ");
  }

  const request = await InstallmentRequest.findById(req.params.id);
  if (!request) {
    res.status(404);
    throw new Error("Không tìm thấy yêu cầu trả góp");
  }

  request.status = status;
  await request.save();
  await request.populate("user", "name email");
  res.json(request);
});

export {
  createInstallmentRequest,
  listInstallmentRequests,
  updateInstallmentRequestStatus,
};
