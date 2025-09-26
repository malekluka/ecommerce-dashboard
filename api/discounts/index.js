import connectDB from '../_lib/db.js';
import Discount from '../_lib/models/Discount.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const discounts = await Discount.find().sort({ createdAt: -1 });
      res.json(discounts);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch discounts' });
    }
  } else if (req.method === 'POST') {
    try {
      const { code, percentage, startDate, endDate, isActive } = req.body;

      const existingDiscount = await Discount.findOne({ code });
      if (existingDiscount) {
        return res.status(400).json({ error: 'Discount code already exists' });
      }

      const discount = new Discount({
        code, percentage, startDate, endDate, isActive
      });

      await discount.save();
      res.status(201).json(discount);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler));