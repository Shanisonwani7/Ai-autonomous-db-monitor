const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getUsers,
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/userController");

// Get Current User Profile
router.get("/profile", authMiddleware, getProfile);

// Update Current User Profile
router.put("/profile", authMiddleware, updateProfile);

// Change User Password
router.put("/change-password", authMiddleware, changePassword);

// Get All Users
router.get("/", authMiddleware, getUsers);

module.exports = router;