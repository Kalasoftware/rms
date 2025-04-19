const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['Morning', 'Evening'], required: true },
  status: { type: String, enum: ['Present', 'Absent'], required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  dailySalary: { type: Number }
});

attendanceSchema.index({ staff: 1, date: 1, shift: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
