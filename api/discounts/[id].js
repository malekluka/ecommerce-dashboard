import connectDB from '../_lib/db.js';
import Discount from '../_lib/models/Discount.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { code, percentage, startDate, endDate, isActive } = req.body;

      const discount = await Discount.findByIdAndUpdate(
        id, 
        { code, percentage, startDate, endDate, isActive }, 
        { new: true }
      );
      
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }

      res.json(discount);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const discount = await Discount.findByIdAndDelete(id);
      if (!discount) {
        return res.status(404).json({ error: 'Discount not found' });
      }
      res.json({ message: 'Discount deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler));