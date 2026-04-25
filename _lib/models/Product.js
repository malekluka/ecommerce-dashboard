import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  image: String,
  productId: String,
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);