const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.listStaff);
router.get('/add', staffController.addStaff);
router.post('/add', staffController.addStaff);
// DELETE staff
router.post('/delete/:id', staffController.deleteStaff);
router.post('/withdraw/:id', staffController.withdrawAmount);
router.post('/withdraw/update/:withdrawalId', staffController.updateWithdrawal);
router.post('/withdraw/delete/:withdrawalId', staffController.deleteWithdrawal);

module.exports = router;
