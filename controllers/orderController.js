const Order = require("../model/orderModel");
const asyncHandler = require("express-async-handler");
const { mockStripe, mockPayPal } = require("../mocks/paymentMocks");
const ErrorResponse = require("../utils/errorResponse");
const Product = require("../model/productModel");
const mockLogistics = require("../mocks/logisticMocks");

// mock payments
mockStripe();
mockPayPal();
mockLogistics();

// @route   POST /api/orders

const addOrderItems = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Update stock for each product in the order
    for (const item of orderItems) {
      const product = await Product.findById(item.product);

      if (product) {
        product.countInStock -= item.qty;
        await product.save();
      } else {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
    }

    res.status(201).json(createdOrder);
  }
});

/// @route   GET /api/orders/:id

const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (order) {
    res.json(order);
  } else {
    return next(new ErrorResponse("no order found", 404));
  }
});

// @route   PUT /api/orders/:id/pay

const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    return next(new ErrorResponse("no order found", 404));
  }
});

// @route   PUT /api/orders/:id/deliver

const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    return next(new ErrorResponse("no order found", 404));
  }
});

// @route   GET /api/orders/myorders

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @route   GET /api/orders

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.status(200).json(orders);
});

module.exports = {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
};
