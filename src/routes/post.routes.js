const express = require("express");
const router = express.Router();
const { createPost, getMyPosts, getPostById, acceptOffer } = require("../controllers/post.controller");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.route("/")
  .post(protect, upload.array("images", 5), createPost);

router.get("/my", protect, getMyPosts);

router.route("/:id")
  .get(protect, getPostById);

router.patch("/:id/accept", protect, acceptOffer);

module.exports = router;
