const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true, default: Date.now },
  note: { type: String }
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
