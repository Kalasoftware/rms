const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.get('/', inventoryController.listInventory);
router.get('/add', inventoryController.getAddInventory);
router.post('/add', inventoryController.postAddInventory);
router.get('/edit/:id', inventoryController.getEditInventory);
router.post('/edit/:id', inventoryController.postEditInventory);
router.post('/delete/:id', inventoryController.deleteInventory);

module.exports = router;
