require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Product = require('../models/Product');
const products = require('./products');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log('Sample products seeded!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
