const Attendance = require('../models/Attendance');
const Staff = require('../models/Staff');
const Withdrawal = require('../models/Withdrawal');
const ejs = require('ejs');
const pdf = require('html-pdf');
const path = require('path');

exports.listAttendance = async (req, res) => {
  // Use the date from the query if present, otherwise use today
  const selectedDate = req.query.date ? new Date(req.query.date) : new Date();
  selectedDate.setHours(0,0,0,0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(selectedDate.getDate() + 1);
  const shift = req.query.shift || 'Morning';
  const staffList = await Staff.find({ isActive: true });
  const attendance = await Attendance.find({ date: { $gte: selectedDate, $lt: nextDay }, shift }).populate('staff');

  // Calculate number of days in the selected month
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const monthStart = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // For each staff, calculate salary as per shift attendance
  const staffSalaryMap = {};
  const staffWithdrawnMap = {};
  const staffBalanceMap = {};
  const staffStatusMap = {};
  const staffWithdrawalsList = {};
  for (const staff of staffList) {
    let monthlySalary = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      dayDate.setHours(0,0,0,0);
      // Get attendance for both shifts
      const morning = await Attendance.findOne({ staff: staff._id, date: dayDate, shift: 'Morning' });
      const evening = await Attendance.findOne({ staff: staff._id, date: dayDate, shift: 'Evening' });
      const presentMorning = morning && morning.status === 'Present';
      const presentEvening = evening && evening.status === 'Present';
      if (presentMorning && presentEvening) {
        monthlySalary += staff.dailySalary || 0;
      } else if (presentMorning || presentEvening) {
        monthlySalary += (staff.dailySalary || 0) / 2;
      }
      // If absent for both, add nothing
    }
    staffSalaryMap[staff._id.toString()] = Math.round(monthlySalary);

    // Calculate withdrawn amount for the month
    const withdrawals = await Withdrawal.find({
      staff: staff._id,
      date: { $gte: monthStart, $lt: new Date(year, month + 1, 1) }
    }).sort({ date: -1 });
    staffWithdrawalsList[staff._id.toString()] = withdrawals;
    const withdrawnAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    staffWithdrawnMap[staff._id.toString()] = withdrawnAmount;
    // Calculate balance and status
    const balance = monthlySalary - withdrawnAmount;
    staffBalanceMap[staff._id.toString()] = balance;
    staffStatusMap[staff._id.toString()] = balance > 0 ? 'Advance' : (balance < 0 ? 'Negative' : 'Settled');
  }

  res.render('attendance/list', {
    staffList,
    attendance,
    date: req.query.date || selectedDate.toISOString().slice(0,10),
    shift,
    user: req.user,
    staffSalaryMap,
    staffWithdrawnMap,
    staffBalanceMap,
    staffStatusMap,
    staffWithdrawalsList,
    month: month + 1,
    year
  });
};

exports.markAttendance = async (req, res) => {
  try {
    const { staffId, status, shift, date, dailySalary } = req.body;
    if (!staffId || !status || !shift || !date) {
      return res.status(400).send('Missing required fields');
    }
    const attDate = new Date(date);
    attDate.setHours(0,0,0,0);
    // Ensure shift is exactly 'Morning' or 'Evening'
    if (shift !== 'Morning' && shift !== 'Evening') {
      return res.status(400).send('Invalid shift');
    }
    await Attendance.findOneAndUpdate(
      { staff: staffId, date: attDate, shift },
      { staff: staffId, date: attDate, shift, status, dailySalary },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.redirect(`/attendance?date=${date}&shift=${shift}`);
  } catch (err) {
    console.error('Attendance mark error:', err);
    res.status(500).send('Error marking attendance');
  }
};

exports.attendancePDF = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0,0,0,0);
    const staffList = await Staff.find({ isActive: true });

    // Calculate number of days in the selected month
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // For each staff, calculate salary as per shift attendance and withdrawals
    const staffSalaryMap = {};
    const staffWithdrawnMap = {};
    const staffBalanceMap = {};
    const staffStatusMap = {};
    const staffWithdrawalsList = {};
    for (const staff of staffList) {
      let monthlySalary = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        dayDate.setHours(0,0,0,0);
        // Get attendance for both shifts
        const morning = await Attendance.findOne({ staff: staff._id, date: dayDate, shift: 'Morning' });
        const evening = await Attendance.findOne({ staff: staff._id, date: dayDate, shift: 'Evening' });
        const presentMorning = morning && morning.status === 'Present';
        const presentEvening = evening && evening.status === 'Present';
        if (presentMorning && presentEvening) {
          monthlySalary += staff.dailySalary || 0;
        } else if (presentMorning || presentEvening) {
          monthlySalary += (staff.dailySalary || 0) / 2;
        }
        // If absent for both, add nothing
      }
      staffSalaryMap[staff._id.toString()] = Math.round(monthlySalary);

      // Calculate withdrawn amount for the month
      const withdrawals = await Withdrawal.find({
        staff: staff._id,
        date: { $gte: new Date(year, month, 1), $lt: new Date(year, month + 1, 1) }
      }).sort({ date: -1 });
      staffWithdrawalsList[staff._id.toString()] = withdrawals;
      const withdrawnAmount = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
      staffWithdrawnMap[staff._id.toString()] = withdrawnAmount;
      // Calculate balance and status
      const balance = monthlySalary - withdrawnAmount;
      staffBalanceMap[staff._id.toString()] = balance;
      staffStatusMap[staff._id.toString()] = balance > 0 ? 'Advance' : (balance < 0 ? 'Negative' : 'Settled');
    }

    // Fetch both shifts' attendance for the selected day (for table display)
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    const morningAttendance = await Attendance.find({ date: { $gte: date, $lt: nextDay }, shift: 'Morning' }).populate('staff');
    const eveningAttendance = await Attendance.find({ date: { $gte: date, $lt: nextDay }, shift: 'Evening' }).populate('staff');

    // Render PDF with salary and withdrawal data
    const html = await ejs.renderFile(path.join(__dirname, '../views/attendance/pdf.ejs'), {
      staffList,
      morningAttendance,
      eveningAttendance,
      date: req.query.date || date.toISOString().slice(0,10),
      user: req.user,
      staffSalaryMap,
      staffWithdrawnMap,
      staffBalanceMap,
      staffStatusMap,
      staffWithdrawalsList,
      month: month + 1,
      year
    });
    pdf.create(html).toStream((err, stream) => {
      if (err) return res.status(500).send('Error generating PDF');
      res.setHeader('Content-type', 'application/pdf');
      res.setHeader('Content-disposition', `attachment; filename=attendance-bothshifts-${date.toISOString().slice(0,10)}.pdf`);
      stream.pipe(res);
    });
  } catch (err) {
    console.error('Attendance PDF error:', err);
    res.status(500).send('Error generating attendance PDF');
  }
};

// exports.deleteAttendance = async (req, res) => {
//   try {
//     const att = await Attendance.findById(req.params.id);
//     if (!att) {
//       return res.status(404).send('Attendance record not found');
//     }
//     await Attendance.deleteOne({ _id: req.params.id });
//     res.redirect(`/attendance?date=${req.query.date||''}&shift=${req.query.shift||''}`);
//   } catch (err) {
//     console.error('Attendance delete error:', err);
//     res.status(500).send('Error deleting attendance record');
//   }
// };
