const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// Protected routes
router.get("/auth/me", authMiddleware, authController.getCurrentUser);

module.exports = router;
