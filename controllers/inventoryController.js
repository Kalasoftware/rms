const Inventory = require('../models/Inventory');

exports.listInventory = async (req, res) => {
  const inventory = await Inventory.find();
  res.render('inventory/list', { title: 'Inventory Management', inventory, user: req.user });
};

exports.getAddInventory = (req, res) => {
  res.render('inventory/add', { title: 'Add Inventory Item', error: null });
};

exports.postAddInventory = async (req, res) => {
  const { name, quantity, unit, lowStockAlert } = req.body;
  try {
    await Inventory.create({ name, quantity, unit, lowStockAlert });
    res.redirect('/inventory');
  } catch (err) {
    res.render('inventory/add', { title: 'Add Inventory Item', error: 'Error adding item' });
  }
};

exports.getEditInventory = async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  res.render('inventory/edit', { title: 'Edit Inventory Item', item, error: null });
};

exports.postEditInventory = async (req, res) => {
  const { name, quantity, unit, lowStockAlert } = req.body;
  try {
    await Inventory.findByIdAndUpdate(req.params.id, { name, quantity, unit, lowStockAlert });
    res.redirect('/inventory');
  } catch (err) {
    const item = await Inventory.findById(req.params.id);
    res.render('inventory/edit', { title: 'Edit Inventory Item', item, error: 'Error updating item' });
  }
};

exports.deleteInventory = async (req, res) => {
  await Inventory.findByIdAndDelete(req.params.id);
  res.redirect('/inventory');
};
