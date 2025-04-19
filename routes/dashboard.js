const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', (req, res, next) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  if (req.session.role === 'admin') {
    return reportController.getDashboardReport(req, res, next);
  }
  res.render('dashboard', { title: 'Dashboard | Shree Annpurna Dhaba', user: req.session });
});

module.exports = router;
