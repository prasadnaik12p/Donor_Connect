const jwt = require('jsonwebtoken');
const Ambulance = require('../models/Ambulance');

const protectAmbulance = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route - no token provided'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log('Decoded token:', decoded); // For debugging
      
      // Check if the token is for an ambulance
      if (decoded.role !== 'ambulance') {
        return res.status(401).json({
          success: false,
          message: 'Not authorized as ambulance - invalid token role'
        });
      }

      // Find ambulance and attach to request
      const ambulance = await Ambulance.findById(decoded.id).select('-password');
      
      if (!ambulance) {
        return res.status(401).json({
          success: false,
          message: 'Ambulance not found in database'
        });
      }

      if (!ambulance.isApproved) {
        return res.status(403).json({
          success: false,
          message: 'Ambulance not approved by admin yet'
        });
      }

      req.user = ambulance;
      console.log('Ambulance authenticated:', ambulance.email); // For debugging
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = { protectAmbulance };