require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

const regions = ['North', 'South', 'East', 'West'];
const categories = ['Electronics', 'Clothing', 'Home', 'Toys', 'Books'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/b-shop');

  await Product.deleteMany({});
  await Order.deleteMany({});

  // create 50 products
  const products = [];
  for (let i = 1; i <= 50; i++) {
    const category = categories[i % categories.length];
    const price = Number((Math.random() * 200 + 5).toFixed(2));
    products.push(await Product.create({ name: `Product ${i}`, category, price }));
  }

  // generate ~2000 orders across 18 months
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 17, 1);
  const orders = [];
  let totalOrders = 2000;
  for (let i = 0; i < totalOrders; i++) {
    const date = new Date(startDate.getTime());
    date.setMonth(startDate.getMonth() + randInt(0, 17));
    date.setDate(randInt(1, 28));
    const region = regions[randInt(0, regions.length - 1)];

    // each order 1-4 items
    const itemCount = randInt(1, 4);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemCount; j++) {
      const p = products[randInt(0, products.length - 1)];
      const qty = randInt(1, 3);
      const priceAtSale = p.price * (1 - (Math.random() * 0.2));
      const revenue = Number((priceAtSale * qty).toFixed(2));
      items.push({ product: p._id, name: p.name, category: p.category, price: Number(priceAtSale.toFixed(2)), quantity: qty });
      total += revenue;
    }

    orders.push({ orderDate: date, region, items, total: Number(total.toFixed(2)) });
  }

  await Order.insertMany(orders);
  console.log('Seeded', products.length, 'products and', orders.length, 'orders');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
