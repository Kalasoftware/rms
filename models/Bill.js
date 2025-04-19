const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true },
  paid: { type: Boolean, default: false },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
