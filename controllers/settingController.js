const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({});
  res.render('setting/index', { title: 'Settings', setting, user: req.user, error: null, success: null });
};

exports.updateSettings = async (req, res) => {
  const { restaurantName, address, phone, taxRate } = req.body;
  let setting = await Setting.findOne();
  if (!setting) setting = await Setting.create({});
  try {
    setting.restaurantName = restaurantName;
    setting.address = address;
    setting.phone = phone;
    setting.taxRate = taxRate;
    setting.updatedAt = Date.now();
    await setting.save();
    res.render('setting/index', { title: 'Settings', setting, user: req.user, error: null, success: 'Settings updated successfully!' });
  } catch (err) {
    res.render('setting/index', { title: 'Settings', setting, user: req.user, error: 'Error updating settings', success: null });
  }
};
