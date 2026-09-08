require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    // 1. Create or Update requested Admin: admin@scrapcars.com / admin4312
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin4312", salt);

    let admin = await User.findOne({ email: "admin@scrapcars.com" });
    if (!admin) {
      admin = await User.create({
        name: "ScrapCars Admin",
        email: "admin@scrapcars.com",
        phone: "+971 50 123 4567",
        password: hashedPassword,
        role: "ADMIN"
      });
      console.log("Admin account created successfully:", admin.email);
    } else {
      admin.password = hashedPassword;
      admin.role = "ADMIN";
      await admin.save();
      console.log("Admin account updated with requested password:", admin.email);
    }

    console.log("Admin setup completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
