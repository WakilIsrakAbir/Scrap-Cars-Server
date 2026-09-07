const CarPost = require("../models/CarPost");
const User = require("../models/User");
const whatsappService = require("../services/whatsapp.service");

const getStats = async (req, res) => {
  try {
    const totalPosts = await CarPost.countDocuments();
    const pendingPosts = await CarPost.countDocuments({ status: "PENDING" });
    const acceptedPosts = await CarPost.countDocuments({ status: { $in: ["ACCEPTED", "CONTACTED"] } });
    const totalUsers = await User.countDocuments();

    // Recent 6 posts for overview dashboard
    const recentPosts = await CarPost.find()
      .populate("userId", "name email phone")
      .sort("-createdAt")
      .limit(6);

    res.json({
      totalPosts,
      pendingPosts,
      acceptedPosts,
      totalUsers,
      recentPosts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await CarPost.find()
      .populate("userId", "name email phone")
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
    ).populate("userId", "name phone email");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Trigger WhatsApp notification to user if possible
    if (post.userId) {
      whatsappService.notifyStatusChange(post.userId, post, req.body.status).catch((err) => {
        console.warn("WhatsApp status notification notice:", err.message);
      });
    }

    res.json({ message: "Status updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort("-createdAt");
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const postCount = await CarPost.countDocuments({ userId: u._id });
        return {
          ...u.toObject(),
          postCount
        };
      })
    );
    res.json({ users: usersWithStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Allowed: USER, ADMIN" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User role changed to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleUserRestriction = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isRestricted = !user.isRestricted;
    await user.save();
    
    res.json({
      message: user.isRestricted ? "User has been restricted" : "User restriction has been lifted",
      isRestricted: user.isRestricted,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isRestricted: user.isRestricted
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await CarPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getStats, 
  getAllPosts, 
  updateStatus, 
  getAllUsers, 
  updateUserRole, 
  toggleUserRestriction, 
  deletePost 
};

