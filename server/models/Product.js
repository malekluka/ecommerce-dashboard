const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  cost: { type: Number, required: true }, // <-- Add this line
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: String,
  productId: String,
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
