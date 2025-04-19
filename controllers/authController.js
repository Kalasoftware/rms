const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login | Shree Annpurna Dhaba', error: null });
};

exports.postLogin = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.render('auth/login', { title: 'Login', error: 'Invalid username or password' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.render('auth/login', { title: 'Login', error: 'Invalid username or password' });
  req.session.userId = user._id;
  req.session.role = user.role;
  res.redirect('/dashboard');
};

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register | Shree Annpurna Dhaba', error: null });
};

exports.postRegister = async (req, res) => {
  const { username, password, role } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.render('auth/register', { title: 'Register', error: 'Username already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hash, role });
  await user.save();
  res.redirect('/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
