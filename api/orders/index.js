import connectDB from '../_lib/db.js';
import Order from '../_lib/models/Order.js';
import Product from '../_lib/models/Product.js';
import Customer from '../_lib/models/Customer.js';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';
import mongoose from 'mongoose';

async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const orders = await Order.find()
        .populate('customer', 'firstName lastName customerId')
        .populate('products.product', 'name price productId')
        .sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    try {
      const { orderId, customer, products, status, payment, address } = req.body;

      if (!orderId || !products?.length) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingOrder = await Order.findOne({ orderId });
      if (existingOrder) {
        return res.status(400).json({ error: "Order ID already exists" });
      }

      // Process products
      const processedProducts = [];
      for (const item of products) {
        if (mongoose.Types.ObjectId.isValid(item.product || item.productId)) {
          processedProducts.push({
            product: new mongoose.Types.ObjectId(item.product || item.productId),
            quantity: item.quantity
          });
        }
      }

      const order = new Order({
        orderId,
        customer: customer ? new mongoose.Types.ObjectId(customer) : undefined,
        products: processedProducts,
        status: status || 'pending',
        payment: payment || 'Unpaid',
        address: address || {}
      });

      await order.save();
      
      const populatedOrder = await Order.findById(order._id)
        .populate('customer', 'firstName lastName customerId')
        .populate('products.product', 'name price productId');
        
      res.status(201).json(populatedOrder);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler)); 