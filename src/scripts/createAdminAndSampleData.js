require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CarPost = require("../models/CarPost");

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

    // 2. Sample Seller User
    const existingSeller = await User.findOne({ role: "USER" });
    let sampleUserId;
    if (existingSeller) {
      sampleUserId = existingSeller._id;
    } else {
      const sellerSalt = await bcrypt.genSalt(10);
      const sellerPassword = await bcrypt.hash("seller123", sellerSalt);
      const newSeller = await User.create({
        name: "Mohammed Al Hashemi",
        email: "seller@scrapcars.com",
        phone: "050 987 6543",
        password: sellerPassword,
        role: "USER"
      });
      sampleUserId = newSeller._id;
      console.log("Sample seller account created:", newSeller.email);
    }

    // 3. Create Sample Car Posts if none exist
    const postsCount = await CarPost.countDocuments();
    if (postsCount === 0) {
      const samplePosts = [
        {
          userId: sampleUserId,
          brand: "Toyota",
          model: "Camry SE",
          year: 2019,
          condition: "damaged",
          description: "Front-end collision on Sheikh Zayed Road. Radiator damaged, engine starts but car not drivable. Need urgent cash and pickup.",
          locationAddress: "Al Barsha 1, near Mall of the Emirates, Dubai",
          images: [
            "/Cars/pexels-introspectivedsgn-9395027.jpg",
            "/Cars/pexels-eyyup-erten-1462748243-28123528.jpg"
          ],
          status: "OFFER_SENT",
          offerPrice: 14500
        },
        {
          userId: sampleUserId,
          brand: "Nissan",
          model: "Altima 2.5",
          year: 2016,
          condition: "engine_dead",
          description: "Transmission slip and blown head gasket. Standing in villa compound for 8 months with expired registration.",
          locationAddress: "Muwaileh Commercial, Sharjah",
          images: [
            "/Cars/pexels-introspectivedsgn-9271245.jpg"
          ],
          status: "PENDING"
        },
        {
          userId: sampleUserId,
          brand: "BMW",
          model: "520i M Sport",
          year: 2020,
          condition: "damaged",
          description: "Right side impact damage and rear quarter dent. Insurance declared total write-off. Looking for quick cash settlement.",
          locationAddress: "Al Reem Island, Abu Dhabi",
          images: [
            "/Cars/pexels-nityanand-hiremath-132133259-10155527.jpg",
            "/Cars/pexels-celalkeser-33375045.jpg"
          ],
          status: "ACCEPTED",
          offerPrice: 32000
        },
        {
          userId: sampleUserId,
          brand: "Honda",
          model: "Civic EX",
          year: 2014,
          condition: "scrap",
          description: "Heavy chassis rust and failed RTA test. Suitable for metal scrap and usable spare parts only.",
          locationAddress: "Al Quoz Industrial 3, Dubai",
          images: [
            "/Cars/pexels-andre-mouton-11270698.jpg"
          ],
          status: "COMPLETED",
          offerPrice: 6500
        }
      ];

      await CarPost.insertMany(samplePosts);
      console.log("Sample car posts seeded successfully: 4 posts created");
    } else {
      console.log(`Car posts already in DB: ${postsCount} posts`);
    }

    console.log("Seeding completed successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
