import connectDB from '../../_lib/db.js';
import UserAdmin from '../../_lib/models/UserAdmin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../../_lib/auth.js';

export default async function handler(req, res) {
  await connectDB();

  const { action } = req.query;

  // -------------------------
  // SIGNUP
  // -------------------------
  if (req.method === 'POST' && action === 'signup') {
    const { username, email, password } = req.body;

    const existingUser = await UserAdmin.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserAdmin({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    return res.status(201).json({
      success: true,
      user: { id: user._id, username, email }
    });
  }

  // -------------------------
  // LOGIN
  // -------------------------
  if (req.method === 'POST' && action === 'login') {
    const { email, password } = req.body;

    const user = await UserAdmin.findOne({
      email: { $regex: new RegExp(email, 'i') }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  }

  // -------------------------
  // ME (protected route)
  // -------------------------
  if (req.method === 'GET' && action === 'me') {
    return authMiddleware(async (req, res) => {
      const user = await UserAdmin.findById(req.userId).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        success: true,
        user
      });
    })(req, res);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}