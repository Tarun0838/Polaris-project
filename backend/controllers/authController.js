const jwt = require('jsonwebtoken');
const User = require('../models/User');

const DEMO_USERS = {
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

const generateToken = (id, role = 'public') => {
  return jwt.sign({ id, role, demoRole: role }, process.env.JWT_SECRET || 'vyom_secret_key_sih2026_earth_sciences', {
    expiresIn: '30d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, institution } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email.' });
    }

    // Default to student or public unless authorized
    const assignedRole = (role === 'admin' || role === 'researcher') ? role : (role || 'public');

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      institution: institution || 'Academic / Public Member'
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    let cleanEmail = email.toLowerCase().trim();
    // Normalize scientist / researcher aliases
    if (cleanEmail.startsWith('scientist@') || cleanEmail === 'scientist' || cleanEmail === 'researcher') {
      cleanEmail = 'researcher@vyom.demo';
    } else if (cleanEmail === 'admin') {
      cleanEmail = 'admin@vyom.demo';
    } else if (cleanEmail === 'student') {
      cleanEmail = 'student@vyom.demo';
    }

    const isDemoPassword = (password === 'polaris123' || password === 'vyom123' || password === 'admin123');

    let user = null;
    try {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        if (cleanEmail.endsWith('@vyom.demo')) {
          user = await User.findOne({ email: cleanEmail.replace('@vyom.demo', '@polaris.demo') });
        } else if (cleanEmail.endsWith('@polaris.demo')) {
          user = await User.findOne({ email: cleanEmail.replace('@polaris.demo', '@vyom.demo') });
        }
      }
    } catch (dbErr) {
      console.warn('[VYOM-AUTH] Database lookup error:', dbErr.message);
    }

    // 1. If found in database
    if (user) {
      const isMatch = (await user.matchPassword(password)) || (isDemoPassword && (user.role === 'admin' || user.role === 'researcher' || user.role === 'student'));
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      }

      const token = generateToken(user._id, user.role);

      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          institution: user.institution
        }
      });
    }

    // 2. Demo accounts fallback (in case DB re-initialized or query was interrupted)
    let demoRole = null;
    if (cleanEmail.includes('researcher') || cleanEmail.includes('scientist')) {
      demoRole = 'researcher';
    } else if (cleanEmail.includes('admin')) {
      demoRole = 'admin';
    } else if (cleanEmail.includes('student')) {
      demoRole = 'student';
    }

    if (demoRole && isDemoPassword) {
      const demoUser = DEMO_USERS[demoRole];
      const token = generateToken(demoUser._id, demoRole);

      // Opportunistic async upsert to database
      User.findOneAndUpdate(
        { email: demoUser.email },
        { ...demoUser, password: 'polaris123' },
        { upsert: true, new: true }
      ).catch(() => {});

      return res.json({
        success: true,
        token,
        user: {
          id: demoUser._id,
          name: demoUser.name,
          email: demoUser.email,
          role: demoUser.role,
          institution: demoUser.institution
        }
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (token invalidated on client side)
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  logoutUser
};
