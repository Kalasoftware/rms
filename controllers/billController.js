const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Setting = require('../models/Setting');
const pdf = require('html-pdf');
const ejs = require('ejs');
const path = require('path');

exports.listBills = async (req, res) => {
  const { payment, type, date } = req.query;
  let filter = {};
  if (payment && payment !== 'all') filter.paymentMethod = payment;
  if (date) {
    // Filter by date (YYYY-MM-DD)
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }
  // For type filter, need to join with Order
  let bills = await Bill.find(filter).populate({
    path: 'order',
    populate: { path: 'items.menuItem' }
  }).sort({ createdAt: -1 });
  if (type && type !== 'all') {
    bills = bills.filter(b => b.order && b.order.type === type);
  }
  // Find orders that are paid but have no bill
  const billedOrderIds = bills.map(b => b.order ? String(b.order._id) : null).filter(Boolean);
  const unbilledPaidOrders = await Order.find({ status: 'paid', _id: { $nin: billedOrderIds } }).populate('items.menuItem');
  // Calculate total
  const totalAmount = bills.reduce((sum, b) => sum + (b.amount || 0), 0);
  res.render('bill/list', {
    title: 'Billing',
    bills,
    unbilledPaidOrders,
    user: req.user,
    filterPayment: payment || 'all',
    filterType: type || 'all',
    filterDate: date || '',
    totalAmount
  });
};

exports.generateBill = async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('items.menuItem');
  if (!order) return res.redirect('/bills');
  let bill = await Bill.findOne({ order: order._id });
  if (!bill) {
    bill = new Bill({ order: order._id, amount: order.total, paid: true });
    await bill.save();
  }
  res.redirect('/bills');
};

exports.payBill = async (req, res) => {
  const { paymentMethod } = req.body;
  await Bill.findByIdAndUpdate(req.params.id, { paymentMethod });
  res.redirect('/bills');
};

exports.viewInvoice = async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate({
    path: 'order',
    populate: { path: 'items.menuItem' }
  });
  const setting = await Setting.findOne();
  if (!bill) return res.redirect('/bills');
  res.render('bill/invoice', { bill, setting });
};

exports.downloadInvoicePDF = async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate({
    path: 'order',
    populate: { path: 'items.menuItem' }
  });
  const setting = await Setting.findOne();
  if (!bill) return res.redirect('/bills');
  // Render EJS to HTML
  ejs.renderFile(path.join(__dirname, '../views/bill/invoice.ejs'), { bill, setting }, (err, html) => {
    if (err) return res.status(500).send('Error generating PDF');
    pdf.create(html).toStream((err, stream) => {
      if (err) return res.status(500).send('Error generating PDF');
      res.setHeader('Content-type', 'application/pdf');
      res.setHeader('Content-disposition', `attachment; filename=invoice-${bill._id}.pdf`);
      stream.pipe(res);
    });
  });
};

exports.editBill = async (req, res) => {
  const { paymentMethod } = req.body;
  await Bill.findByIdAndUpdate(req.params.id, {
    paymentMethod
  });
  res.redirect('/bills');
};

exports.deleteBill = async (req, res) => {
  await Bill.findByIdAndDelete(req.params.id);
  res.redirect('/bills');
};

exports.generateAllBills = async (req, res) => {
  // Find all paid orders without a bill
  const bills = await Bill.find();
  const billedOrderIds = bills.map(b => b.order ? String(b.order._id) : null).filter(Boolean);
  const unbilledPaidOrders = await Order.find({ status: 'paid', _id: { $nin: billedOrderIds } }).populate('items.menuItem');
  for (const order of unbilledPaidOrders) {
    let bill = await Bill.findOne({ order: order._id });
    if (!bill) {
      bill = new Bill({ order: order._id, amount: order.total, paid: true });
      await bill.save();
    }
  }
  res.redirect('/bills');
};
