const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  phone: { type: String },
  dailySalary: { type: Number },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Staff', staffSchema);
