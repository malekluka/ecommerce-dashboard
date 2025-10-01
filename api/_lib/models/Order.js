import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
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
  discount: { type: String, required: false },
  total: { type: Number, required: false },
  createdAt: { type: Date, default: Date.now },  // Add this
  updatedAt: { type: Date, default: Date.now }   // Add this
}, { timestamps: false });  // Change to false

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);