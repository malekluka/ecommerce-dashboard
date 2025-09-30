import connectDB from "../_lib/db.js";
import Order from "../_lib/models/Order.js";
import { corsMiddleware, authMiddleware } from "../_lib/auth.js";

async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const order = await Order.findById(id)
        .populate("customer", "firstName lastName customerId")
        .populate("products.product", "name price productId");

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { orderId, status, payment, address, products, discount, total } =
        req.body;

      const updateData = { orderId, status, payment, address };

      // If products are being updated, recalculate total
      if (products && products.length > 0) {
        let calculatedTotal = 0;
        const processedProducts = [];

        for (const item of products) {
          if (mongoose.Types.ObjectId.isValid(item.product)) {
            processedProducts.push({
              product: new mongoose.Types.ObjectId(item.product),
              quantity: item.quantity,
            });

            const product = await Product.findById(item.product);
            if (product) {
              calculatedTotal += product.price * item.quantity;
            }
          }
        }

        // Apply discount
        if (discount) {
          const Discount = mongoose.models.Discount;
          if (Discount) {
            const discountDoc = await Discount.findById(discount);
            if (discountDoc) {
              calculatedTotal =
                calculatedTotal * (1 - discountDoc.percentage / 100);
            }
          }
        }

        updateData.products = processedProducts;
        updateData.discount = discount;
        updateData.total = total && total > 0 ? total : calculatedTotal;
      }

      const order = await Order.findByIdAndUpdate(id, updateData, { new: true })
        .populate("customer", "firstName lastName customerId")
        .populate("products.product", "name price productId");

      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(order);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ message: "Order deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

export default corsMiddleware(authMiddleware(handler));
