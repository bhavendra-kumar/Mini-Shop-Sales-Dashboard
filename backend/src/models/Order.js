const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  category: String,
  price: Number,
  quantity: Number
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderDate: { type: Date, required: true },
  region: { type: String, required: true },
  items: [OrderItemSchema],
  total: { type: Number, required: true }
});

module.exports = mongoose.model('Order', OrderSchema);
