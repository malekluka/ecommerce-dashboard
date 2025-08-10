require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Discount = require('../models/Discount')
const discounts = require('./discounts');

const MONGO_URI = process.env.MONGO_URI ;

mongoose.connect(MONGO_URI)
  .then(() => Discount.deleteMany({}))
  .then(() => Discount.insertMany(discounts))
  .then(() => {
    console.log('Discounts seeded successfully!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error seeding discounts:', err);
    process.exit(1);
  });

