const mongoose = require('mongoose');

const products = [
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318382'),
    productId: "P-1001",
    name: "Apple iPhone 14 Pro",
    description: "6.1-inch display, A16 Bionic chip, Pro camera system.",
    price: 999.99,
    cost: 750.00,
    stock: 50,
    category: "Electronics",
    image: "https://www.apple.com/newsroom/images/product/iphone/geo/Apple-iPhone-14-Pro-iPhone-14-Pro-Max-space-black-220907-geo_inline.jpg.large_2x.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318383'),
    productId: "P-1002",
    name: "Sony WH-1000XM4 Headphones",
    description: "Industry-leading noise canceling with Dual Noise Sensor technology.",
    price: 349.99,
    cost: 220.00,
    stock: 80,
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318384'),
    productId: "P-1003",
    name: "Levi's 501 Original Jeans",
    description: "Classic straight leg jeans, 100% cotton.",
    price: 59.99,
    cost: 25.00,
    stock: 120,
    category: "Clothing",
    image: "https://myer-media.com.au/wcsstore/MyerCatalogAssetStore/images/40/406/3454/501/1/523738810/523738810_1_2_720x928.webp?w=1920&q=75"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318385'),
    productId: "P-1004",
    name: "Adidas Ultraboost 22",
    description: "Responsive running shoes with Primeknit upper.",
    price: 180.00,
    cost: 100.00,
    stock: 70,
    category: "Clothing",
    image: "https://i1.t4s.cz//products/gx5587/adidas-ultraboost-22-w-401031-gx5587-960.webp"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318386'),
    productId: "P-1005",
    name: "De'Longhi Espresso Machine",
    description: "Automatic espresso, cappuccino, and latte machine.",
    price: 499.99,
    cost: 320.00,
    stock: 30,
    category: "Home & Kitchen",
    image: "https://brandmart.store/wp-content/uploads/2021/08/EC221.B-2.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318387'),
    productId: "P-1006",
    name: "The Midnight Library by Matt Haig",
    description: "A bestselling novel exploring the choices that go into a life well lived.",
    price: 13.99,
    cost: 5.00,
    stock: 200,
    category: "Books",
    image: "https://m.media-amazon.com/images/I/81J6APjwxlL._AC_UF1000,1000_QL80_.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318388'),
    productId: "P-1007",
    name: "Neutrogena Hydro Boost Water Gel",
    description: "Oil-free, non-comedogenic face moisturizer.",
    price: 18.99,
    cost: 7.00,
    stock: 90,
    category: "Beauty & Personal Care",
    image: "https://m.media-amazon.com/images/I/71fnQLykuAL.jpg"
  },
  {
    _id: new mongoose.Types.ObjectId('663b6e179e5dae0022318389'),
    productId: "P-1008",
    name: "Manduka PRO Yoga Mat",
    description: "High-density cushion, joint protection, and unmatched support.",
    price: 120.00,
    cost: 60.00,
    stock: 40,
    category: "Sports & Outdoors",
    image: "https://m.media-amazon.com/images/I/91HXNbA57BL._AC_UF1000,1000_QL80_.jpg"
  }
];

module.exports = products;