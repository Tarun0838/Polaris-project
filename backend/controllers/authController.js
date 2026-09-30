const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'vyom_secret_key_sih2026_earth_sciences', {
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

    const token = generateToken(user._id);

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

    let user = await User.findOne({ email });
    if (!user) {
      if (email.endsWith('@vyom.demo')) {
        user = await User.findOne({ email: email.replace('@vyom.demo', '@polaris.demo') });
      } else if (email.endsWith('@polaris.demo')) {
        user = await User.findOne({ email: email.replace('@polaris.demo', '@vyom.demo') });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user._id);

    res.json({
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
