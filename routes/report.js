const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/', reportController.getDashboardReport);
router.get('/sales', reportController.getSalesReport);
router.get('/inventory', reportController.getInventoryReport);

module.exports = router;
