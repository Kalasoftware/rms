const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

router.get('/', billController.listBills);
router.get('/generate/:orderId', billController.generateBill);
router.get('/invoice/:id', billController.viewInvoice);
router.get('/pdf/:id', billController.downloadInvoicePDF);
router.post('/pay/:id', billController.payBill);
router.post('/edit/:id', billController.editBill);
router.post('/delete/:id', billController.deleteBill);
router.get('/generate-all', billController.generateAllBills);

module.exports = router;
