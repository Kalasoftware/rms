const Order = require('../models/Order');
const Menu = require('../models/Menu');

exports.listOrders = async (req, res) => {
  const orders = await Order.find().populate('items.menuItem').sort({ createdAt: -1 });
  res.render('order/list', { title: 'Order Management', orders, user: req.user });
};

exports.getAddOrder = async (req, res) => {
  const menu = await Menu.find({ available: true });
  // Get distinct table numbers from existing orders
  const tables = await Order.distinct('table');
  res.render('order/add', { title: 'Add Order', menu, tables, error: null, user: req.user });
};

exports.postAddOrder = async (req, res) => {
  const { table, newTable, type, itemsData, customItem, customPrice } = req.body;
  try {
    let orderTable = table === '__new' && newTable ? newTable : table;
    let orderItems = [];
    // Parse itemsData (JSON string from frontend)
    if (itemsData) {
      let parsedItems = [];
      try {
        parsedItems = JSON.parse(itemsData);
      } catch (e) {}
      for (let it of parsedItems) {
        orderItems.push({ menuItem: it.id, quantity: it.quantity });
      }
    }
    // Handle custom item
    if (customItem && customPrice) {
      const tempMenu = await Menu.create({
        name: customItem,
        category: 'Custom',
        price: Number(customPrice),
        description: 'Custom item',
        available: false
      });
      orderItems.push({ menuItem: tempMenu._id, quantity: 1 });
    }
    // Calculate total
    let total = 0;
    for (let it of orderItems) {
      const menu = await Menu.findById(it.menuItem);
      total += menu ? menu.price * it.quantity : 0;
    }
    const order = new Order({
      table: orderTable,
      items: orderItems,
      status: 'pending',
      type,
      total,
      createdBy: req.session.userId
    });
    await order.save();
    res.redirect('/orders');
  } catch (err) {
    const menu = await Menu.find({ available: true });
    const tables = await Order.distinct('table');
    res.render('order/add', { title: 'Add Order', menu, tables, error: 'Error creating order', user: req.user });
  }
};

exports.getUpdateOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.menuItem');
  const menu = await Menu.find({ available: true });
  // Get distinct table numbers from existing orders
  const tables = await Order.distinct('table');
  res.render('order/update', { title: 'Update Order', order, menu, tables, error: null, user: req.user });
};

exports.postUpdateOrder = async (req, res) => {
  const { status, table, newTable } = req.body;
  try {
    // Determine updated table
    let updatedTable = table === '__new' && newTable ? newTable : table;
    // Handle items update (if provided)
    let update = { status, table: updatedTable };
    // Parse items array (supporting [0], [1], ... keys)
    let orderItems = [];
    if (req.body.items) {
      const items = req.body.items;
      const keys = Object.keys(items);
      // items = { '0': {menuItem, quantity}, ... } or items = [{menuItem, quantity}, ...]
      if (Array.isArray(items)) {
        for (let it of items) {
          if (it.menuItem && it.quantity) {
            orderItems.push({ menuItem: it.menuItem, quantity: Number(it.quantity) });
          }
        }
      } else {
        // Handle object with numeric keys
        for (let k of keys) {
          const it = items[k];
          if (it.menuItem && it.quantity) {
            orderItems.push({ menuItem: it.menuItem, quantity: Number(it.quantity) });
          }
        }
      }
    }
    if (orderItems.length > 0) {
      update.items = orderItems;
      // Recalculate total
      let total = 0;
      for (let it of orderItems) {
        const menu = await Menu.findById(it.menuItem);
        total += menu ? menu.price * it.quantity : 0;
      }
      update.total = total;
    }
    await Order.findByIdAndUpdate(req.params.id, update);
    res.redirect('/orders');
  } catch (err) {
    const order = await Order.findById(req.params.id).populate('items.menuItem');
    const menu = await Menu.find({ available: true });
    const tables = await Order.distinct('table');
    res.render('order/update', { title: 'Update Order', order, menu, tables, error: 'Error updating order', user: req.user });
  }
};

exports.deleteOrder = async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.redirect('/orders');
};

// Render the live table management page
exports.renderLiveTablesPage = async (req, res) => {
  res.render('order/live-tables', { user: req.user });
};

// Enhanced live table status with item details
exports.getLiveTables = async (req, res) => {
  try {
    // Get all unique table names
    const allTables = await Order.distinct('table');
    // Get all non-paid orders with items and status
    const orders = await Order.find({ status: { $ne: 'paid' } }).populate('items.menuItem');
    // Group orders by table
    const tableMap = {};
    orders.forEach(order => {
      if (!tableMap[order.table]) tableMap[order.table] = [];
      tableMap[order.table].push(order);
    });
    const tables = allTables.map(table => {
      const tableOrders = tableMap[table] || [];
      let occupied = tableOrders.length > 0;
      let preparing = [], served = [];
      tableOrders.forEach(order => {
        if (order.status === 'preparing') {
          order.items.forEach(it => {
            if (it.menuItem) preparing.push(it.menuItem.name + ' x' + it.quantity);
          });
        } else if (order.status === 'served') {
          order.items.forEach(it => {
            if (it.menuItem) served.push(it.menuItem.name + ' x' + it.quantity);
          });
        }
      });
      return {
        table,
        occupied,
        preparing,
        served
      };
    });
    res.json({ tables });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get live tables' });
  }
};

// Free up a table (mark all non-paid orders for that table as paid)
exports.freeTable = async (req, res) => {
  try {
    const { table } = req.body;
    await Order.updateMany({ table, status: { $ne: 'paid' } }, { status: 'paid' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to free table' });
  }
};
