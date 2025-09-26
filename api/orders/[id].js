import connectDB from '../_lib/db.js';
import Order from '../_lib/models/Order.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const order = await Order.findById(id)
        .populate('customer', 'firstName lastName customerId')
        .populate('products.product', 'name price productId');
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { status, payment, address } = req.body;

      const order = await Order.findByIdAndUpdate(
        id, 
        { status, payment, address }, 
        { new: true }
      );
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json({ message: 'Order deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler));