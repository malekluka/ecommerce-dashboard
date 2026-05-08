import connectDB from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { name, description, price, cost, stock, category, productId } = req.body;

      const product = await Product.findByIdAndUpdate(
        id, 
        { name, description, price, cost, stock, category, productId }, 
        { new: true }
      );
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler));