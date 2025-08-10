const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String,required:true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: false },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, min: 1 }
    }
  ],
  status: { type: String, default: "pending" },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  payment: { type: String, default: "Unpaid" },
  discount: { type: String, required: false }, // store discount _id as string
  total: { type: Number, required: false } // store discounted total
  // Add more fields as needed (e.g., payment info)
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

// No changes needed for cart functionality.

