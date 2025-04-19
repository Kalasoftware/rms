const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Shree Annpurna Dhaba' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  taxRate: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Setting', settingSchema);
