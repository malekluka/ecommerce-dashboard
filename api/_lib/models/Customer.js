import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);