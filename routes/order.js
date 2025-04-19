const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.listOrders);
router.get('/add', orderController.getAddOrder);
router.post('/add', orderController.postAddOrder);
router.get('/update/:id', orderController.getUpdateOrder);
router.post('/update/:id', orderController.postUpdateOrder);
router.post('/delete/:id', orderController.deleteOrder);

// Live table management page
router.get('/live-tables', orderController.renderLiveTablesPage);

// Live table status API
router.get('/live-tables/status', orderController.getLiveTables);

// Free table API
router.post('/live-tables/free', orderController.freeTable);

module.exports = router;
