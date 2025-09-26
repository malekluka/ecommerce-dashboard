import connectDB from '../_lib/db.js';
import Customer from '../_lib/models/Customer.js';
import bcrypt from 'bcryptjs';
import { corsMiddleware, authMiddleware } from '../_lib/auth.js';

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { username, email, password, firstName, lastName, address, phone } = req.body;
      
      const updateData = { username, email, firstName, lastName, address, phone };
      
      if (password) {
        const hashed = await bcrypt.hash(password, 12);
        updateData.password = hashed;
      }

      const customer = await Customer.findByIdAndUpdate(id, updateData, { new: true });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      res.json(customer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      res.json({ message: 'Customer deleted' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default corsMiddleware(authMiddleware(handler));