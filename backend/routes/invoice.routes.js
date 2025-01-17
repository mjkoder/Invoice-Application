const express = require('express');
const {
  getInvoices,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  triggerZapier,
} = require('../controllers/invoice.controller');

const router = express.Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.patch('/:invoiceId', updateInvoice);
router.patch('/:invoiceId/markPaid', markInvoicePaid);
router.post('/trigger-zap', triggerZapier);

module.exports = router;
