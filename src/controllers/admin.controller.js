const CarPost = require("../models/CarPost");
const User = require("../models/User");

const getStats = async (req, res) => {
  try {
    const totalPosts = await CarPost.countDocuments();
    const pendingPosts = await CarPost.countDocuments({ status: "PENDING" });
    const completedPosts = await CarPost.countDocuments({ status: "COMPLETED" });
    const totalUsers = await User.countDocuments();

    res.json({ totalPosts, pendingPosts, completedPosts, totalUsers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await CarPost.find()
      .populate("userId", "name phone")
      .sort("-createdAt");
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const post = await CarPost.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ message: "Status updated", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendOffer = async (req, res) => {
  try {
    const post = await CarPost.findByIdAndUpdate(
      req.params.id,
      { offerPrice: req.body.offerPrice, status: "OFFER_SENT" },
      { new: true }
    );
    res.json({ message: "Offer sent", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getAllPosts, updateStatus, sendOffer, getAllUsers };
