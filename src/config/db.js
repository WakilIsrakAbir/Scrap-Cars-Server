const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Ignore exit for local dev without real mongo uri
    // process.exit(1);
    console.log("Running without DB for now...");
  }
};

module.exports = connectDB;
