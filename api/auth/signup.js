import connectDB from '../_lib/db.js';
import UserAdmin from '../_lib/models/UserAdmin.js';
import bcrypt from 'bcryptjs';
import { corsMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  const { username, email, password } = req.body;

  try {
    // Check if user exists
    const existingUser = await UserAdmin.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Create user
    const user = new UserAdmin({
      username,
      email,
      password: hashed
    });

    await user.save();

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
      message: 'Server error' 
    });
  }
}

export default corsMiddleware(handler);