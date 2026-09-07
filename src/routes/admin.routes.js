const express = require("express");
const router = express.Router();
const { 
  getStats, 
  getAllPosts, 
  updateStatus, 
  getAllUsers, 
  updateUserRole, 
  toggleUserRestriction, 
  deletePost 
} = require("../controllers/admin.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// Protect all admin routes with both protect (JWT) and admin (Role) middlewares
router.use(protect, admin);

router.get("/stats", getStats);
router.get("/posts", getAllPosts);
router.patch("/posts/:id/status", updateStatus);
router.delete("/posts/:id", deletePost);

router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/restriction", toggleUserRestriction);

module.exports = router;

