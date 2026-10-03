const jwt = require('jsonwebtoken');
const User = require('../models/User');

const DEMO_FALLBACK_USERS = {
  researcher: {
    _id: '674843000000000000000002',
    name: 'Dr. Rohit Srivastava',
    email: 'researcher@vyom.demo',
    role: 'researcher',
    institution: 'National Centre for Polar and Ocean Research (NCPOR), Goa'
  },
  admin: {
    _id: '674843000000000000000001',
    name: 'Dr. M. Ravichandran',
    email: 'admin@vyom.demo',
    role: 'admin',
    institution: 'Ministry of Earth Sciences (MoES), New Delhi'
  },
  student: {
    _id: '674843000000000000000003',
    name: 'Aarav Sharma',
    email: 'student@vyom.demo',
    role: 'student',
    institution: 'Indian Institute of Technology (IIT) Delhi'
  }
};

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Please log in.' });
  }

  // Handle client-side quick demo token
  if (token === 'demo-jwt-token-active' || token.startsWith('demo-')) {
    req.user = DEMO_FALLBACK_USERS.researcher;
    return next();
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'vyom_secret_key_sih2026_earth_sciences');
    } catch (e) {
      decoded = jwt.verify(token, 'polaris_secret_key_sih2026_earth_sciences');
    }

    try {
      req.user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {
      console.warn('[VYOM-AUTH] User lookup by ID error:', dbErr.message);
    }

    // Fallback if user record temporarily absent in DB
    if (!req.user && decoded.demoRole && DEMO_FALLBACK_USERS[decoded.demoRole]) {
      req.user = DEMO_FALLBACK_USERS[decoded.demoRole];
    } else if (!req.user && decoded.role && DEMO_FALLBACK_USERS[decoded.role]) {
      req.user = DEMO_FALLBACK_USERS[decoded.role];
    }

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
    }
    next();
  } catch (err) {
    if (token === 'demo-jwt-token-active' || token.startsWith('demo-')) {
      req.user = DEMO_FALLBACK_USERS.researcher;
      return next();
    }
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

  if (token === 'demo-jwt-token-active' || token.startsWith('demo-')) {
    req.user = DEMO_FALLBACK_USERS.researcher;
    return next();
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'vyom_secret_key_sih2026_earth_sciences');
    } catch (e) {
      decoded = jwt.verify(token, 'polaris_secret_key_sih2026_earth_sciences');
    }
    try {
      req.user = await User.findById(decoded.id).select('-password');
    } catch (dbErr) {}

    if (!req.user && decoded.demoRole && DEMO_FALLBACK_USERS[decoded.demoRole]) {
      req.user = DEMO_FALLBACK_USERS[decoded.demoRole];
    }
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
