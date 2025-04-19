const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/', expenseController.listExpenses);
router.get('/add', expenseController.getAddExpense);
router.post('/add', expenseController.addExpense);
router.post('/delete/:id', expenseController.deleteExpense);
router.post('/category/add', expenseController.addCategory);
router.post('/category/delete/:id', expenseController.deleteCategory);

module.exports = router;
