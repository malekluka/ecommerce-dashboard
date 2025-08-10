const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const UserAdmin = require('../models/UserAdmin');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Enhanced rate limiter configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many attempts, please try again later',
  skipSuccessfulRequests: true, // Don't count successful attempts
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many attempts. Account temporarily locked for 15 minutes.'
    });
  }
});

// Input validation middleware
const validateSignup = [
  body('username').trim().isLength({ min: 3 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
];

// Signup with improved security
router.post('/signup', authLimiter, validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { username, email, password } = req.body;

  try {
    // Check for existing user
    const exists = await UserAdmin.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Hash password with stronger cost factor
    const hashed = await bcrypt.hash(password, 12);
    const user = await UserAdmin.create({ 
      username, 
      email, 
      password: hashed 
    });

    // Don't return password hash
    res.status(201).json({ 
      success: true,
      message: 'User created successfully',
      user: { 
        id: user._id,
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
});

// Login with better security
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array() 
    });
  }

  const { email, password } = req.body;

  try {
    // Find user with case-insensitive email
    const user = await UserAdmin.findOne({ 
      email: { $regex: new RegExp(email, 'i') } 
    });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create JWT with secure settings
    const token = jwt.sign(
      { 
        id: user._id,
        role: user.role // Add role if your system has roles
      }, 
      process.env.JWT_SECRET, 
      { 
        expiresIn: '1d',
        algorithm: 'HS256' 
      }
    );

    // Secure cookie settings for production
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ 
      success: true,
      token, // Also send token in response for mobile clients
      user: { 
        id: user._id,
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await UserAdmin.findById(req.userId)
      .select('-password -__v'); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.json({ 
      success: true,
      user 
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

module.exports = router;