const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  table: { type: String },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
      quantity: { type: Number, default: 1 }
    }
  ],
  status: { type: String, enum: ['pending', 'preparing', 'served', 'paid'], default: 'pending' },
  type: { type: String, enum: ['dine-in', 'takeaway'], default: 'dine-in' },
  createdAt: { type: Date, default: Date.now },
  total: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Order', orderSchema);
