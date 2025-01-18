const mongoose = require('mongoose');

const AutomatedRecipientSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  recipientName: { type: String, required: true },
  recipientEmail: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Due', 'Overdue', 'Paid'], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AutomatedRecipient', AutomatedRecipientSchema);
