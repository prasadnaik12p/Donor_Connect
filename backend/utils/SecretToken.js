require("dotenv").config();
const jwt = require("jsonwebtoken");

const createSecretToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { createSecretToken, verifyToken };