const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const ErrorResponse = require("../utils/errorResponse");

// auth middleware
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("no user found with this id", 404));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access", 401));
  }
};

// isAdmin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

module.exports = { protect, admin };
