import connectDB from '../_lib/db.js';
import UserAdmin from '../_lib/models/UserAdmin.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const user = await UserAdmin.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email 
      }
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
}

export default corsMiddleware(authMiddleware(handler));