const express = require("express");
const router = express.Router();
const { getStats, getAllPosts, updateStatus, sendOffer, getAllUsers } = require("../controllers/admin.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// Protect all admin routes with both protect (JWT) and admin (Role) middlewares
router.use(protect, admin);

router.get("/stats", getStats);
router.get("/posts", getAllPosts);
router.patch("/posts/:id/status", updateStatus);
router.patch("/posts/:id/offer", sendOffer);
router.get("/users", getAllUsers);

module.exports = router;
