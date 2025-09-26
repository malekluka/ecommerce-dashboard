import connectDB from '../_lib/db.js';
import Product from '../_lib/models/Product.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, price, cost, stock, category, productId } = req.body;

      const existingProduct = await Product.findOne({ productId });
      if (existingProduct) {
        return res.status(400).json({ message: 'Product ID already exists' });
      }

      const product = new Product({
        name, description, price, cost, stock, category, productId
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler));