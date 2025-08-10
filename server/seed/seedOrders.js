require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const orders = require('./orders');

const MONGO_URI = process.env.MONGO_URI;

async function seedOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const seededOrders = [];
    
    for (const order of orders) {
      // Validate required fields
      if (!order.orderId || !order.products?.length) {
        console.warn(`Skipping invalid order: ${order.orderId || 'no-order-id'}`);
        continue;
      }

      // Resolve products with validation
      const resolvedProducts = [];
      for (const p of order.products) {
        if (!p.productId || !p.quantity) {
          console.warn(`Skipping invalid product in order ${order.orderId}`);
          continue;
        }

        const productDoc = await Product.findOne({ productId: p.productId });
        if (!productDoc) {
          console.warn(`Product not found: ${p.productId} in order ${order.orderId}`);
          continue;
        }

        resolvedProducts.push({
          product: productDoc._id,
          quantity: Math.max(1, p.quantity) // Ensure minimum quantity of 1
        });
      }

      // Skip if no valid products
      if (resolvedProducts.length === 0) {
        console.warn(`Skipping order ${order.orderId} - no valid products`);
        continue;
      }

      // Resolve customer
      let customerId = null;
      if (order.customer) {
        const customerDoc = await Customer.findOne({
          $or: [
            { customerId: order.customer },
            { _id: order.customer }
          ]
        });
        customerId = customerDoc?._id || null;
      }

      // Prepare order document
      const orderDoc = {
        orderId: order.orderId,
        customer: customerId,
        products: resolvedProducts,
        status: order.status || 'pending',
        payment: order.payment || 'Unpaid',
        address: order.address || {},
        createdAt: order.createdAt || new Date(),
        updatedAt: order.updatedAt || new Date()
      };

      seededOrders.push(orderDoc);
    }

    // Clear existing orders
    await Order.deleteMany({});
    console.log(`Deleted existing orders`);

    // Insert new orders
    const result = await Order.insertMany(seededOrders, { 
      timestamps: false // Preserve our custom dates
    });
    
    console.log(`Successfully seeded ${result.length} orders`);
    
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedOrders();