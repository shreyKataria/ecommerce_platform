const Product = require("../model/productModel");
const asyncHandler = require("express-async-handler");
const ErrorResponse = require("../utils/errorResponse");

// @route   GET /api/products

const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    // res.status(404);
    return next(new ErrorResponse("no product found", 404));
  }
});

// @route   POST /api/products

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, image, brand, category, description, rating } = req.body;
  const product = new Product({
    name: name,
    price: price,
    user: req.user._id,
    image: image,
    brand: brand,
    category: category,
    countInStock: 0,
    numReviews: 0,
    description: description,
    rating: rating,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @route   PUT /api/products/:id

const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, image, brand, category, countInStock } =
    req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name;
    product.price = price;
    product.description = description;
    product.image = image;
    product.brand = brand;
    product.category = category;
    product.countInStock = countInStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    return next(new ErrorResponse("no product found", 404));
  }
});

// @route   DELETE /api/products/:id

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    res.json({ message: "Product removed" });
  } else {
    return next(new ErrorResponse("no product found", 404));
  }
});

// exports

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
