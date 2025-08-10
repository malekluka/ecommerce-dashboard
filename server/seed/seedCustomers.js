require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const customers = require('./customers');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    await Customer.deleteMany({});
    await Customer.insertMany(customers);
    console.log('Sample customers seeded!');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
