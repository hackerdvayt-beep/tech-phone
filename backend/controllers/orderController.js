import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Order from '../models/orderModel.js'
import User from '../models/userModel.js'
import InstallmentRequest from '../models/installmentRequestModel.js'

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    installmentRequest,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body

  let savedInstallmentRequest
  if (paymentMethod === 'Installment') {
    savedInstallmentRequest = await InstallmentRequest.findOne({
      _id: installmentRequest,
      user: req.user._id,
    })
    if (!savedInstallmentRequest) {
      res.status(400)
      throw new Error('Vui lòng gửi yêu cầu tư vấn trả góp trước khi đặt hàng')
    }
    if (
      !Number.isFinite(Number(totalPrice)) ||
      Math.abs(Number(totalPrice) - savedInstallmentRequest.orderTotal) > 0.01
    ) {
      res.status(400)
      throw new Error(
        'Giá trị giỏ hàng đã thay đổi. Vui lòng gửi lại yêu cầu tư vấn trả góp'
      )
    }

    const requestItems = savedInstallmentRequest.items || []
    const orderItemsMatch =
      Array.isArray(orderItems) &&
      orderItems.length === requestItems.length &&
      orderItems.every((item, index) => {
        const requestedItem = requestItems[index]
        return (
          item &&
          requestedItem &&
          String(item.product) === String(requestedItem.product) &&
          item.name === requestedItem.name &&
          Number(item.qty) === requestedItem.qty &&
          String(item.color || '') === requestedItem.color &&
          String(item.size || '') === requestedItem.size &&
          Number(item.bundleDiscountPercent || 0) ===
            requestedItem.bundleDiscountPercent &&
          Math.abs(Number(item.price) - requestedItem.price) <= 0.01
        )
      })
    const submittedTotals = [
      Number(itemsPrice),
      Number(shippingPrice),
      Number(taxPrice),
      Number(totalPrice),
    ]
    const requestTotals = [
      savedInstallmentRequest.itemsPrice,
      savedInstallmentRequest.shippingPrice,
      savedInstallmentRequest.taxPrice,
      savedInstallmentRequest.orderTotal,
    ]
    const totalsMatch = submittedTotals.every(
      (value, index) =>
        Number.isFinite(value) &&
        Math.abs(value - requestTotals[index]) <= 0.01
    )

    if (!orderItemsMatch || !totalsMatch) {
      res.status(400)
      throw new Error(
        'Giỏ hàng đã thay đổi. Vui lòng gửi lại yêu cầu tư vấn trả góp'
      )
    }
  }

  if (orderItems && orderItems.length === 0) {
    res.status(400)
    throw new Error('No order items')
    return
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      installmentRequest: savedInstallmentRequest?._id,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    })

    const createdOrder = await order.save()

    res.status(201).json(createdOrder)
  }
})

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate(
      'installmentRequest',
      'applicantName downPaymentPercent termMonths orderTotal downPaymentAmount monthlyPayment status'
    )

  if (order) {
    res.json(order)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to paid
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isPaid = true
    order.paidAt = Date.now()
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    }

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)

  if (order) {
    order.isDelivered = true
    order.deliveredAt = Date.now()

    const updatedOrder = await order.save()

    res.json(updatedOrder)
  } else {
    res.status(404)
    throw new Error('Order not found')
  }
})

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
  res.json(orders)
})

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name')
  res.json(orders)
})

const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '')

const lookupOrder = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone)
  const orderId = String(req.body.orderId || '').trim()

  if (!phone && !orderId) {
    res.status(400)
    throw new Error('Vui lòng nhập số điện thoại hoặc mã đơn hàng')
  }

  if (phone && (phone.length < 9 || phone.length > 12)) {
    res.status(400)
    throw new Error('Số điện thoại không hợp lệ')
  }

  let orders
  if (orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      res.status(400)
      throw new Error('Mã đơn hàng không hợp lệ')
    }

    const order = await Order.findById(orderId).populate('user', 'phone')
    if (
      !order ||
      (phone && normalizePhone(order.user?.phone) !== phone)
    ) {
      res.status(404)
      throw new Error('Không tìm thấy đơn hàng phù hợp')
    }
    orders = [order]
  } else {
    const users = await User.find({ phone: { $exists: true, $ne: '' } }).select(
      '_id phone'
    )
    const userIds = users
      .filter((user) => normalizePhone(user.phone) === phone)
      .map((user) => user._id)
    orders = await Order.find({ user: { $in: userIds } })
      .sort({ createdAt: -1 })
      .limit(10)
  }

  if (!orders.length) {
    res.status(404)
    throw new Error('Không tìm thấy đơn hàng phù hợp')
  }

  res.json({
    orders: orders.map((order) => ({
      orderId: order._id,
      createdAt: order.createdAt,
      totalPrice: order.totalPrice,
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      deliveredAt: order.deliveredAt,
      status: order.isDelivered
        ? 'Đã giao hàng'
        : order.paymentMethod === 'Installment'
          ? 'Chờ nhân viên liên hệ tư vấn trả góp'
          : order.paymentMethod === 'COD'
            ? 'Chờ giao hàng - thanh toán khi nhận hàng'
            : order.paymentMethod === 'Bank QR' && !order.isPaid
              ? 'Chờ chuyển khoản ngân hàng'
              : order.isPaid
                ? 'Đang xử lý giao hàng'
                : 'Chờ xác nhận thanh toán',
    })),
  })
})

export {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  lookupOrder,
}
