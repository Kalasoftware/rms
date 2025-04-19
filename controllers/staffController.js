const Staff = require('../models/Staff');
const Withdrawal = require('../models/Withdrawal');

exports.listStaff = async (req, res) => {
  const staffList = await Staff.find();
  res.render('staff/list', { staffList, user: req.user });
};

exports.addStaff = async (req, res) => {
  if (req.method === 'GET') {
    return res.render('staff/add', { user: req.user });
  }
  const { name, role, phone, dailySalary } = req.body;
  await Staff.create({ name, role, phone, dailySalary });
  res.redirect('/attendance');
};

exports.deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.redirect('/attendance');
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).send('Error deleting staff member');
  }
};

exports.withdrawAmount = async (req, res) => {
  try {
    const staffId = req.params.id;
    const { amount, note } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid amount');
    }
    await Withdrawal.create({
      staff: staffId,
      amount: Number(amount),
      note: note || '',
      date: new Date()
    });
    res.redirect('/attendance');
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).send('Error processing withdrawal');
  }
};

exports.updateWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req.params.withdrawalId;
    const { amount, note } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).send('Invalid amount');
    }
    await Withdrawal.findByIdAndUpdate(withdrawalId, {
      amount: Number(amount),
      note: note || ''
    });
    res.redirect('/attendance');
  } catch (err) {
    console.error('Update withdrawal error:', err);
    res.status(500).send('Error updating withdrawal');
  }
};

exports.deleteWithdrawal = async (req, res) => {
  try {
    const withdrawalId = req.params.withdrawalId;
    await Withdrawal.findByIdAndDelete(withdrawalId);
    res.redirect('/attendance');
  } catch (err) {
    console.error('Delete withdrawal error:', err);
    res.status(500).send('Error deleting withdrawal');
  }
};
