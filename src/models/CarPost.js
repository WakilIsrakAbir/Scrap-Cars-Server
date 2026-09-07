const mongoose = require("mongoose");

const carPostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  condition: { type: String, required: true },
  description: { type: String },
  locationAddress: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs
  status: { 
    type: String, 
    enum: ["PENDING", "UNDER_REVIEW", "CONTACTED", "ACCEPTED", "PICKUP_SCHEDULED", "COMPLETED", "REJECTED", "CANCELLED", "OFFER_SENT"],
    default: "PENDING"
  },
  offerPrice: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model("CarPost", carPostSchema);
