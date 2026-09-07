require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/auth.routes");
const postRoutes = require("./src/routes/post.routes");
const adminRoutes = require("./src/routes/admin.routes");

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB connected on every request in serverless
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.get("/", (req, res) => res.send("ScrapCars API is running"));
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
