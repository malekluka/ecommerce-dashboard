const mongoose = require('mongoose');
const products = require('./products');
const customers = require('./customers');

// Add _id fields to products if they don't exist
const productsWithIds = products.map(product => ({
  ...product,
  _id: product._id || new mongoose.Types.ObjectId()
}));

// Add _id fields to customers if they don't exist
const customersWithIds = customers.map(customer => ({
  ...customer,
  _id: customer._id || new mongoose.Types.ObjectId()
}));

// Helper to get product ObjectId
function getProductId(productId) {
  const product = productsWithIds.find(p => p.productId === productId);
  if (!product) {
    console.error(`Product not found: ${productId}`);
    return null;
  }
  return product._id;
}

// Helper to get customer ObjectId
function getCustomerId(customerId) {
  const customer = customersWithIds.find(c => c.customerId === customerId);
  if (!customer) {
    console.error(`Customer not found: ${customerId}`);
    return null;
  }
  return customer._id;
}

// Helper to get a random customer ID from the customers array
function getRandomCustomerId() {
  const randomIndex = Math.floor(Math.random() * customersWithIds.length);
  return customersWithIds[randomIndex].customerId;
}

const orders = [
  {
    orderId: "ORD-001",
    customer: getCustomerId(getRandomCustomerId()),
    products: [
      {
        product: getProductId("P-1001"),
        productId: "P-1001",
        quantity: 2,
        priceAtPurchase: 999.99
      },
      {
        product: getProductId("P-1002"),
        productId: "P-1002",
        quantity: 1,
        priceAtPurchase: 349.99
      }
    ],
    status: "pending",
    payment: "Paid",
    totalAmount: (999.99 * 2) + 349.99,
    address: {
      street: "123 Demo St",
      city: "Demo City",
      state: "Demo State",
      postalCode: "12345",
      country: "DemoLand"
    },
    createdAt: new Date("2024-06-04T10:00:00Z")
  },
  {
    orderId: "ORD-002",
    customer: getCustomerId(getRandomCustomerId()),
    products: [
      {
        product: getProductId("P-1003"),
        productId: "P-1003",
        quantity: 1,
        priceAtPurchase: 59.99
      },
      {
        product: getProductId("P-1004"),
        productId: "P-1004",
        quantity: 1,
        priceAtPurchase: 180.00
      }
    ],
    status: "shipped",
    payment: "Partially Paid",
    totalAmount: 59.99 + 180.00,
    address: {
      street: "456 Main Ave",
      city: "Sampleville",
      state: "Sample State",
      postalCode: "54321",
      country: "SampleLand"
    },
    createdAt: new Date("2024-06-10T14:00:00Z")
  },
  {
    orderId: "ORD-003",
    customer: getCustomerId(getRandomCustomerId()),
    products: [
      {
        product: getProductId("P-1005"),
        productId: "P-1005",
        quantity: 1,
        priceAtPurchase: 499.99
      },
      {
        product: getProductId("P-1006"),
        productId: "P-1006",
        quantity: 2,
        priceAtPurchase: 13.99
      }
    ],
    status: "delivered",
    payment: "Unpaid",
    totalAmount: 499.99 + (13.99 * 2),
    address: {
      street: "789 Test Blvd",
      city: "Test City",
      state: "Test State",
      postalCode: "67890",
      country: "Testonia"
    },
    createdAt: new Date("2024-06-14T09:00:00Z")
  },
  {
    orderId: "ORD-004",
    customer: getCustomerId(getRandomCustomerId()),
    products: [
      {
        product: getProductId("P-1007"),
        productId: "P-1007",
        quantity: 3,
        priceAtPurchase: 18.99
      },
      {
        product: getProductId("P-1008"),
        productId: "P-1008",
        quantity: 1,
        priceAtPurchase: 120.00
      }
    ],
    status: "pending",
    payment: "Paid",
    totalAmount: (18.99 * 3) + 120.00,
    address: {
      street: "101 Growth Ave",
      city: "Growth City",
      state: "Growth State",
      postalCode: "11111",
      country: "Growthland"
    },
    createdAt: new Date("2024-06-18T12:00:00Z")
  },
  {
    orderId: "ORD-005",
    customer: getCustomerId(getRandomCustomerId()),
    products: [
      {
        product: getProductId("P-1001"),
        productId: "P-1001",
        quantity: 1,
        priceAtPurchase: 999.99
      },
      {
        product: getProductId("P-1003"),
        productId: "P-1003",
        quantity: 2,
        priceAtPurchase: 59.99
      }
    ],
    status: "shipped",
    payment: "Paid",
    totalAmount: 999.99 + (59.99 * 2),
    address: {
      street: "202 Order Lane",
      city: "Purchase City",
      state: "Checkout State",
      postalCode: "20202",
      country: "Cartland"
    },
    createdAt: new Date("2024-06-20T16:00:00Z")
  }
];

// Filter out any orders with invalid references
const validOrders = orders.filter(order => {
  const validCustomer = order.customer !== null;
  const validProducts = order.products.every(p => p.product !== null);
  
  if (!validCustomer) console.error(`Skipping order ${order.orderId} - invalid customer`);
  if (!validProducts) console.error(`Skipping order ${order.orderId} - invalid products`);
  
  return validCustomer && validProducts;
});

console.log(`Prepared ${validOrders.length} valid orders out of ${orders.length}`);
console.log('Sample order:', JSON.stringify(validOrders[0], null, 2));

module.exports = validOrders;