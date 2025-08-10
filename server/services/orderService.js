const Order = require('../models/Order');

async function getOrderWithTotals(order) {
  await order.populate('products.product');
  await order.populate('customer', 'firstName lastName customerId');

  const { total, cost } = order.products.reduce(
    (acc, item) => {
      if (!item.product) return acc;
      const price = item.product.price || 0;
      const prodCost = item.product.cost || 0;
      acc.total += price * item.quantity;
      acc.cost += prodCost * item.quantity;
      return acc;
    },
    { total: 0, cost: 0 }
  );

  const orderObj = order.toObject();
  orderObj.total = typeof order.total === "number" ? order.total : total;
  orderObj.cost = cost;
  return orderObj;
}

async function getOrdersWithTotals(orders) {
  return Promise.all(orders.map(getOrderWithTotals));
}

module.exports = {
  getOrderWithTotals,
  getOrdersWithTotals
};
