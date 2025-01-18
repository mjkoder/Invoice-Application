const express = require('express');
const {
  getInvoices,
  createInvoice,
  updateInvoice,
  markInvoicePaid,
  triggerZapier,
  automateReminder
} = require('../controllers/invoice.controller');

const router = express.Router();

router.get('/', getInvoices);
router.post('/', createInvoice);
router.patch('/:invoiceId', updateInvoice);
router.patch('/:invoiceId/markPaid', markInvoicePaid);
router.post('/trigger-zap', triggerZapier);
router.post('/automate-reminder', automateReminder);

module.exports = router;
