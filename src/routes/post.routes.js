const express = require("express");
const router = express.Router();
const { createPost, getMyPosts, getPostById, acceptOffer, updateMyPost, deleteMyPost } = require("../controllers/post.controller");
const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

router.route("/")
  .post(protect, upload.array("images", 5), createPost);

router.get("/my", protect, getMyPosts);

router.route("/:id")
  .get(protect, getPostById)
  .patch(protect, updateMyPost)
  .delete(protect, deleteMyPost);

router.patch("/:id/accept", protect, acceptOffer);

module.exports = router;

