const asyncHandler = require("express-async-handler");
const User = require("../model/userModel");
const ErrorResponse = require("../utils/errorResponse");

// @route   POST /api/users/register
const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return next(new ErrorResponse("user already exist", 400));
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    sendToken(user, 200, res);
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @route   POST /api/users/login
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(" Invalid credentials", 401));
  }
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("wrong password", 401));
  }
  if (user && isMatch) {
    sendToken(user, 200, res);
  } else {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    sendToken(user, 201, res);
  } else {
    return next(new ErrorResponse("user already exist", 401));
  }
});

// @route   PUT /api/users/profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: user.getSignedToken(updatedUser.id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  res.status(statusCode).json({ success: true, token, user });
};
// exports
module.exports = {
  signUp,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
