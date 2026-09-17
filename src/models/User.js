const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: false },
  googleId: { type: String, sparse: true, unique: true },
  avatar: { type: String },
  authProvider: { type: String, enum: ["local", "google"], default: "local" },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  isRestricted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

