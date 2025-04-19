const Order = require('../models/Order');
const Bill = require('../models/Bill');
const Inventory = require('../models/Inventory');
const Expense = require('../models/Expense');

exports.getDashboardReport = async (req, res) => {
  // Summary stats for dashboard
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Total Orders
  const totalOrders = await Order.countDocuments();
  // Pending Orders
  const pendingOrders = await Order.countDocuments({ status: { $in: ['pending', 'in-progress'] } });
  // Total Sales (all time)
  const totalSalesAgg = await Bill.aggregate([
    { $match: { paid: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const totalSales = totalSalesAgg[0] ? totalSalesAgg[0].total : 0;
  // Today's Sales
  const salesTodayAgg = await Bill.aggregate([
    { $match: { createdAt: { $gte: today, $lt: tomorrow }, paid: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const salesToday = salesTodayAgg[0] ? salesTodayAgg[0].total : 0;
  // Today's Expenses (use correct date field)
  const expensesTodayAgg = await Expense.aggregate([
    { $match: { date: { $gte: today, $lt: tomorrow } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const expensesToday = expensesTodayAgg[0] ? expensesTodayAgg[0].total : 0;

  res.render('dashboard', {
    title: 'Admin Dashboard',
    totalOrders,
    pendingOrders,
    totalSales,
    salesToday,
    expensesToday,
    user: req.user
  });
};

exports.getSalesReport = async (req, res) => {
  const { date } = req.query;
  let filter = { paid: true };
  let filterDate = '';
  if (date) {
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
    filterDate = date;
  }
  const bills = await Bill.find(filter).populate({
    path: 'order',
    populate: { path: 'items.menuItem' }
  });
  res.render('report/sales', { title: 'Sales Report', bills, user: req.user, filterDate });
};

exports.getInventoryReport = async (req, res) => {
  const inventory = await Inventory.find();
  res.render('report/inventory', { title: 'Inventory Report', inventory });
};

// Expenses Report Page
exports.getExpensesReport = async (req, res) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const expenses = await Expense.find().populate('category').sort({ date: -1 });
  const expensesTodayAgg = await Expense.aggregate([
    { $match: { date: { $gte: today, $lt: tomorrow } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  const expensesToday = expensesTodayAgg[0] ? expensesTodayAgg[0].total : 0;
  res.render('report/expenses', { title: 'Expenses Report', expenses, expensesToday, user: req.user });
};
