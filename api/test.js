import connectDB from './_lib/db.js';

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Test database connection
    await connectDB();
    
    res.json({
      success: true,
      message: 'API is working!',
      database: 'Connected to MongoDB',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      message: 'API Error',
      error: error.message
    });
  }
}