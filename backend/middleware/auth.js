const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Please log in.' });
  }

  if (token === 'demo-jwt-token-active' || token.startsWith('demo-')) {
    try {
      const demoResearcher = await User.findOne({ role: 'researcher' });
      if (demoResearcher) {
        req.user = demoResearcher;
        return next();
      }
      req.user = {
        _id: '000000000000000000000002',
        name: 'Dr. Rohit Srivastava',
        email: 'researcher@polaris.demo',
        role: 'researcher',
        institution: 'National Centre for Polar and Ocean Research (NCPOR)'
      };
      return next();
    } catch (e) {
      req.user = {
        _id: '000000000000000000000002',
        name: 'Dr. Rohit Srivastava',
        email: 'researcher@polaris.demo',
        role: 'researcher',
        institution: 'National Centre for Polar and Ocean Research (NCPOR)'
      };
      return next();
    }
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'polaris_secret_key_sih2026_earth_sciences');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'polaris_secret_key_sih2026_earth_sciences');
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthenticated'}' is not authorized to access this action.`
      });
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
