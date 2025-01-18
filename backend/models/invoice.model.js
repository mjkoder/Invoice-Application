const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceNumber: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Due', 'Paid', 'Overdue'],
      default: 'Due',
    },
    recipient: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
);

// Make invoiceNumber unique per user
invoiceSchema.index({ creator: 1, invoiceNumber: 1 }, { unique: true });

// Overdue check pre-save
invoiceSchema.pre('save', function (next) {
  if (this.status !== 'Paid' && this.dueDate < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
