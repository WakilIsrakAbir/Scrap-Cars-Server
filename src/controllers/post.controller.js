const CarPost = require("../models/CarPost");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const whatsappService = require("../services/whatsapp.service");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "scrapcars" },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const createPost = async (req, res) => {
  try {
    const { brand, model, year, condition, description, locationAddress } = req.body;
    let imageUrls = [];

    // Upload images to Cloudinary (skip gracefully if Cloudinary is not configured)
    if (req.files && req.files.length > 0) {
      try {
        const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
        imageUrls = await Promise.all(uploadPromises);
      } catch (uploadErr) {
        console.warn("Cloudinary upload failed (skipping images):", uploadErr.message);
        // Continue without images if Cloudinary is not configured
      }
    }

    const post = await CarPost.create({
      userId: req.user._id,
      brand,
      model,
      year,
      condition,
      description,
      locationAddress,
      images: imageUrls,
    });

    // Notify Admin via WhatsApp (non-blocking)
    try {
      const user = await User.findById(req.user._id);
      whatsappService.notifyAdminNewCarPost(post, user).catch((err) => {
        console.warn("WhatsApp admin notification error:", err.message);
      });
    } catch (e) {
      // Ignore WhatsApp errors
    }

    const whatsappChatUrl = whatsappService.generateWhatsAppLink(
      process.env.ADMIN_WHATSAPP_NUMBER || "971501234567",
      `Hi ScrapCars Dubai! I just submitted my ${year} ${brand} ${model} (Post ID: ${post._id}) for valuation.`
    );

    res.status(201).json({ 
      message: "Post created successfully", 
      post,
      whatsappChatUrl
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMyPosts = async (req, res) => {
  try {
    const posts = await CarPost.find({ userId: req.user._id }).sort("-createdAt");
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await CarPost.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json({ post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptOffer = async (req, res) => {
  try {
    const post = await CarPost.findOne({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    if (post.status !== "OFFER_SENT") {
      return res.status(400).json({ message: "No offer to accept" });
    }

    post.status = "ACCEPTED";
    await post.save();

    const user = await User.findById(req.user._id);
    whatsappService.notifyStatusChange(user, post, "ACCEPTED").catch((err) => {
      console.error("WhatsApp user accept notification error:", err);
    });

    res.json({ message: "Offer accepted successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMyPost = async (req, res) => {
  try {
    const { brand, model, year, condition, description, locationAddress } = req.body;
    const post = await CarPost.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { brand, model, year, condition, description, locationAddress },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMyPost = async (req, res) => {
  try {
    const post = await CarPost.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getMyPosts, getPostById, acceptOffer, updateMyPost, deleteMyPost };

