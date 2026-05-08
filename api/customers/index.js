import connectDB from "../_lib/db.js";
import Customer from "../_lib/models/Customer.js";
import bcrypt from "bcryptjs";
import { corsMiddleware, authMiddleware } from "../_lib/auth.js";

async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    try {
      const customers = await Customer.find()
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(customers);
    } catch (err) {
      console.error("Get customers error:", err);
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  } else if (req.method === "POST") {
    try {
      const { username, email, password, firstName, lastName, address, phone } =
        req.body;

      if (
        !username ||
        !email ||
        !password ||
        !firstName ||
        !lastName ||
        !address ||
        !phone
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if customer exists
      const existingCustomer = await Customer.findOne({
        $or: [{ email }, { username }],
      });

      if (existingCustomer) {
        return res.status(400).json({ error: "Customer already exists" });
      }

      // Generate customerId
      const lastCustomer = await Customer.findOne({}).sort({ customerId: -1 });
      let nextId = 1001;
      if (lastCustomer && lastCustomer.customerId) {
        const match = lastCustomer.customerId.match(/^C-(\d+)$/);
        if (match) {
          nextId = parseInt(match[1], 10) + 1;
        }
      }
      const customerId = `C-${nextId}`;

      // Hash password
      const hashed = await bcrypt.hash(password, 12);

      const customer = new Customer({
        customerId,
        username,
        email,
        password: hashed,
        firstName,
        lastName,
        address,
        phone,
      });

      await customer.save();
      // Remove password before sending response
      const { password: _, ...customerData } = customer.toObject();
      res.status(201).json(customerData); // Return the customer object
    } catch (err) {
      console.error("Create customer error:", err);
      res.status(500).json({ error: "Failed to create customer" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default corsMiddleware(authMiddleware(handler));
