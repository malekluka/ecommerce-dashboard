const express = require('express');
const router = express.Router();
const Discount = require('../models/Discount');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Add a new discount
router.post('/', async (req, res) => {
  try {
    const newDiscount = new Discount(req.body);
    const savedDiscount = await newDiscount.save();
    res.status(201).json(savedDiscount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await Discount.find();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single discount by ID
router.get('/:id', async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) return res.status(404).json({ error: 'Discount not found' });
    res.json(discount);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a discount by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedDiscount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDiscount) return res.status(404).json({ error: 'Discount not found' });
    res.json(updatedDiscount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a discount by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedDiscount = await Discount.findByIdAndDelete(req.params.id);
    if (!deletedDiscount) return res.status(404).json({ error: 'Discount not found' });
    res.json({ message: 'Discount deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
