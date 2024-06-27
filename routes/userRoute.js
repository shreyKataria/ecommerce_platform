const express = require("express");
const router = express.Router();

const {
  signUp,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

// test
router.get("/users", async (req, res) => {
  try {
    res.json("hello");
  } catch (error) {
    console.log("error", error);
  }
});

// routes
router.post("/users/register", signUp);
router.post("/users/login", loginUser);
router
  .route("/users/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
