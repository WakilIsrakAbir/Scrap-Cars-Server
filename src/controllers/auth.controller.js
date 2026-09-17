const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const userExists = await User.findOne({ email: email?.toLowerCase() });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email?.toLowerCase(),
      phone,
      password: hashedPassword,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatar: user.avatar 
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.isRestricted) {
      return res.status(403).json({ 
        message: "Your account has been restricted by administrator. Please contact support." 
      });
    }

    res.json({
      token: generateToken(user._id),
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatar: user.avatar,
        isRestricted: user.isRestricted 
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const { sub: googleId, email, name, picture } = payload;
    const normalizedEmail = email.toLowerCase();

    // Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email: normalizedEmail }]
    });

    if (user) {
      if (user.isRestricted) {
        return res.status(403).json({ 
          message: "Your account has been restricted by administrator. Please contact support." 
        });
      }

      let shouldSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        shouldSave = true;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        shouldSave = true;
      }
      if (shouldSave) {
        await user.save();
      }
    } else {
      user = await User.create({
        name: name || "Google User",
        email: normalizedEmail,
        googleId,
        avatar: picture || "",
        authProvider: "google",
      });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isRestricted: user.isRestricted,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ message: "Google authentication failed: " + (error.message || "Unknown error") });
  }
};

module.exports = { register, login, googleAuth };

