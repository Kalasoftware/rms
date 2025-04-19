const Menu = require('../models/Menu');

exports.listMenu = async (req, res) => {
  const menu = await Menu.find();
  res.render('menu/list', { title: 'Menu Management', menu, user: req.user });
};

exports.getAddMenu = (req, res) => {
  res.render('menu/add', { title: 'Add Menu Item', error: null });
};

exports.postAddMenu = async (req, res) => {
  const { name, category, price, description, available } = req.body;
  try {
    await Menu.create({ name, category, price, description, available: !!available });
    res.redirect('/menu');
  } catch (err) {
    res.render('menu/add', { title: 'Add Menu Item', error: 'Error adding item' });
  }
};

exports.getEditMenu = async (req, res) => {
  const item = await Menu.findById(req.params.id);
  res.render('menu/edit', { title: 'Edit Menu Item', item, error: null });
};

exports.postEditMenu = async (req, res) => {
  const { name, category, price, description, available } = req.body;
  try {
    await Menu.findByIdAndUpdate(req.params.id, { name, category, price, description, available: !!available });
    res.redirect('/menu');
  } catch (err) {
    const item = await Menu.findById(req.params.id);
    res.render('menu/edit', { title: 'Edit Menu Item', item, error: 'Error updating item' });
  }
};

exports.deleteMenu = async (req, res) => {
  await Menu.findByIdAndDelete(req.params.id);
  res.redirect('/menu');
};
