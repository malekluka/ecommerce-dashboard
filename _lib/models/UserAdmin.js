import mongoose from 'mongoose';

const UserAdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.UserAdmin || mongoose.model('UserAdmin', UserAdminSchema);