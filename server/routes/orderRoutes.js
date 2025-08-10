const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Discount = require('../models/Discount'); // You must have this model
const authMiddleware = require('../middleware/authMiddleware');
const orderService = require('../services/orderService');
const mongoose = require('mongoose');

router.use(authMiddleware);

// Utility to normalize input (customer + products)
async function normalizeOrderInput(body) {
  // --- CUSTOMER HANDLING ---
  let customer = body.customer;

  if (customer && typeof customer === "string") {
    if (/^[a-f\d]{24}$/i.test(customer)) {
      // FIX: use new mongoose.Types.ObjectId() instead of mongoose.Types.ObjectId()
      body.customer = new mongoose.Types.ObjectId(customer);
    } else {
      const found = await Customer.findOne({
        $or: [
          { firstName: new RegExp(customer, "i") },
          { lastName: new RegExp(customer, "i") },
          { username: new RegExp(customer, "i") }
        ]
      });
      if (found) {
        body.customer = found._id;
      } else {
        throw new Error("Customer not found");
      }
    }
  } else {
    body.customer = undefined;
  }

  // --- PRODUCTS HANDLING ---
  if (!Array.isArray(body.products) || body.products.length === 0) {
    throw new Error("Products array is required");
  }

  body.products = body.products
    .map(item => {
      const product = item.product || item.productId;
      return {
        // FIX: use new mongoose.Types.ObjectId() instead of mongoose.Types.ObjectId()
        product: mongoose.Types.ObjectId.isValid(product)
          ? new mongoose.Types.ObjectId(product)
          : undefined,
        quantity: item.quantity
      };
    })
    .filter(p => p.product && p.quantity > 0);

  if (body.products.length === 0) {
    throw new Error("At least one valid product is required");
  }

  return body;
}

// Utility to calculate discounted total
async function calculateDiscountedTotal(products, discountId) {
  let total = 0;
  for (const item of products) {
    if (!item.product || !item.quantity) continue;
    const prod = await Product.findById(item.product);
    if (prod) {
      total += prod.price * item.quantity;
    }
  }
  let discountPercent = 0;
  if (discountId) {
    const discountObj = await Discount.findById(discountId);
    if (discountObj && discountObj.percentage > 0) {
      discountPercent = discountObj.percentage;
    }
  }
  return discountPercent > 0 ? total * (1 - discountPercent / 100) : total;
}

// GET all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    const ordersWithTotal = await orderService.getOrdersWithTotals(orders);
    res.json(ordersWithTotal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create Order (with better validation)
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { orderId, status, payment, products } = req.body;
    if (!orderId || !status || !payment || !products?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if orderId already exists
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {
      return res.status(400).json({ error: "Order ID already exists" });
    }

    const body = await normalizeOrderInput(req.body);

    // --- Calculate discounted total and attach discount id ---
    body.discount = req.body.discount || undefined;
    body.total = await calculateDiscountedTotal(body.products, body.discount);

    const order = new Order(body);
    const saved = await order.save();
    const populated = await orderService.getOrderWithTotals(saved);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /:id - Update Order (with existence check)
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Preserve original products if none provided
    if (!req.body.products || req.body.products.length === 0) {
      req.body.products = order.products;
    }

    const body = await normalizeOrderInput(req.body);

    // --- Calculate discounted total and attach discount id ---
    body.discount = req.body.discount || undefined;
    body.total = await calculateDiscountedTotal(body.products, body.discount);

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );
    const populated = await orderService.getOrderWithTotals(updated);
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /:id - Delete Order (with existence check)
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'firstName lastName username')
      .populate('products.product', 'name price productId');
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
