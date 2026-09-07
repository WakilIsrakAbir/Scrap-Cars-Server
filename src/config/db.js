const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected || (mongoose.connections && mongoose.connections[0]?.readyState >= 1)) {
    isConnected = true;
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host} (DB: ${conn.connection.name})`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;

