const express = require("express");
const router = express.Router();
const { register, login, googleAuth } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);

module.exports = router;

