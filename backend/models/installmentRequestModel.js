import mongoose from "mongoose";

export const INSTALLMENT_REQUEST_STATUSES = [
  "Chờ nhân viên liên hệ tư vấn trả góp",
  "Đã liên hệ khách hàng",
  "Đang tư vấn",
  "Đã tư vấn xong",
  "Khách từ chối tư vấn",
];

const installmentItemSchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },
    name: {
      type: String,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    color: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    bundleDiscountPercent: {
      type: Number,
      enum: [0, 15],
      default: 0,
    },
  },
  { _id: false }
);

const installmentRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    downPaymentPercent: {
      type: Number,
      required: true,
      enum: [30, 50, 70],
    },
    termMonths: {
      type: Number,
      required: true,
      enum: [6, 9, 12],
    },
    items: {
      type: [installmentItemSchema],
      default: [],
    },
    itemsPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderTotal: {
      type: Number,
      required: true,
      min: 1,
    },
    downPaymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    monthlyPayment: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      default: "Chờ nhân viên liên hệ tư vấn trả góp",
      enum: INSTALLMENT_REQUEST_STATUSES,
    },
  },
  {
    timestamps: true,
  }
);

const InstallmentRequest = mongoose.model(
  "InstallmentRequest",
  installmentRequestSchema
);

export default InstallmentRequest;
