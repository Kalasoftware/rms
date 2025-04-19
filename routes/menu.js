const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/', menuController.listMenu);
router.get('/add', menuController.getAddMenu);
router.post('/add', menuController.postAddMenu);
router.get('/edit/:id', menuController.getEditMenu);
router.post('/edit/:id', menuController.postEditMenu);
router.post('/delete/:id', menuController.deleteMenu);

module.exports = router;
