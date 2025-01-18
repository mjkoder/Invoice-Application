const express = require('express');
const {
  triggerZapier,
  addRecipientToAutomation,
  removeRecipientFromAutomation,
  getAutomatedRecipients
} = require('../controllers/zapier.controller');

const router = express.Router();

router.get('/', getAutomatedRecipients); 
router.post('/trigger-zap', triggerZapier);
router.post('/add', addRecipientToAutomation);
router.post('/remove', removeRecipientFromAutomation);

module.exports = router;
