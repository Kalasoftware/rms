const Expense = require('../models/Expense');
const ExpenseCategory = require('../models/ExpenseCategory');

exports.listExpenses = async (req, res) => {
  const expenses = await Expense.find().populate('category').sort({ date: -1 });
  const categories = await ExpenseCategory.find();
  res.render('expense/list', { title: 'Expenses', expenses, categories, user: req.user });
};

exports.getAddExpense = async (req, res) => {
  try {
    const categories = await ExpenseCategory.find();
    res.render('expense/add', {
      title: 'Add Expense',
      categories,
      message: req.flash ? req.flash('message') : null,
      user: req.user || null
    });
  } catch (err) {
    res.status(500).send('Error loading add expense page: ' + err.message);
  }
};

exports.addExpense = async (req, res) => {
  const { amount, description, category } = req.body;
  const createdBy = req.user && req.user._id ? req.user._id : req.session && req.session.userId;
  if (!amount || !description || !category) {
    if (req.flash) req.flash('message', 'All fields are required!');
    return res.redirect('/expenses/add');
  }
  if (!createdBy) {
    if (req.flash) req.flash('message', 'User not authenticated!');
    return res.redirect('/expenses/add');
  }
  try {
    await Expense.create({ amount, description, category, createdBy });
    if (req.flash) req.flash('message', 'Expense added successfully!');
    res.redirect('/expenses');
  } catch (err) {
    if (req.flash) req.flash('message', 'Error adding expense: ' + err.message);
    res.redirect('/expenses/add');
  }
};

exports.deleteExpense = async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.redirect('/expenses');
};

exports.addCategory = async (req, res) => {
  const { name } = req.body;
  await ExpenseCategory.create({ name });
  res.redirect('/expenses');
};

exports.deleteCategory = async (req, res) => {
  await ExpenseCategory.findByIdAndDelete(req.params.id);
  res.redirect('/expenses');
};
