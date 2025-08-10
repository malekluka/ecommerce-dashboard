const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new customer
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    const { username, email, password, firstName, lastName, address, phone } = req.body;
    if (!username || !email || !password || !firstName || !lastName || !address || !phone) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Generate customerId in format C-1001, C-1002, ...
    let customerId = req.body.customerId;
    if (!customerId) {
      // Find the highest customerId number
      const lastCustomer = await Customer.findOne({}).sort({ customerId: -1 });
      let nextId = 1001;
      if (lastCustomer && lastCustomer.customerId) {
        const match = lastCustomer.customerId.match(/^C-(\d+)$/);
        if (match) {
          nextId = parseInt(match[1], 10) + 1;
        }
      }
      customerId = `C-${nextId}`;
    }

    // Check for duplicate username/email
    const existingUser = await Customer.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const newCustomer = new Customer({
      customerId,
      username,
      email,
      password,
      firstName,
      lastName,
      address,
      phone
    });
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a customer
router.put('/:id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCustomer) return res.status(404).json({ error: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a customer
router.delete('/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
