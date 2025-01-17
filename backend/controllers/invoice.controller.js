const Invoice = require('../models/invoice.model');
const User = require('../models/user.model');
const transporter = require('../config/nodemailer');

// GET /invoices?status=&sort=
exports.getInvoices = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { status, sort } = req.query;

    let query = { creator: req.user._id };

    if (status && status !== 'all') {
      query.status = status; 
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'asc') {
      sortObj = { createdAt: 1 };
    }

    const invoices = await Invoice.find(query).sort(sortObj);

    for (let invoice of invoices) {
      if (invoice.status !== 'Paid' && invoice.dueDate < new Date()) {
        invoice.status = 'Overdue';
        await invoice.save();
      }
    }

    return res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return res.status(500).send({ error: 'Internal server error' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const {
      invoiceNumber,
      amount,
      dueDate,
      status,
      recipientName,
      recipientPhone,
      recipientEmail,
      recipientAddress,
    } = req.body;

    const newInvoice = new Invoice({
      creator: req.user._id,
      invoiceNumber,
      amount,
      dueDate,
      status: status || 'Due',
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        email: recipientEmail,
        address: recipientAddress,
      },
      createdAt: new Date(),
    });

    await newInvoice.save();

    const user = await User.findById(req.user._id);
    user.invoices.push(newInvoice._id); //push to user's 'invoices' array
    await user.save();

    res.json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error.code === 11000) { // for duplicate check
      return res.status(400).json({
        error:
          'Invoice number already exists for this user. Please use a different invoice number.',
      });
    }
    res.status(500).send({ error: 'Internal server error' });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { invoiceId } = req.params;
    const { markPaid, dueDate } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ message: 'Invoice not found' });
    }

    // Check ownership
    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    
    if (invoice.status === 'Paid' && (markPaid || dueDate)) {
      return res.status(400).send({
        message: 'Invoice is already paid and cannot be modified.',
      });
    }

    if (markPaid) { 
      invoice.status = 'Paid';
    }

    if (dueDate) { 
      invoice.dueDate = dueDate;
    }

    if (invoice.status !== 'Paid' && invoice.dueDate < new Date()) {
      invoice.status = 'Overdue';
    }

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

exports.markInvoicePaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { enteredEmail } = req.body;

    if (!req.user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ message: 'Invoice not found' });
    }

    
    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).send({ message: 'Invoice is already paid.' });
    }

    if (invoice.recipient.email !== enteredEmail) {
      return res.status(400).send({ message: 'Recipient email mismatch.' });
    }

    // Mark as paid
    invoice.status = 'Paid';
    await invoice.save();

    res.json({ message: 'Invoice marked as paid.', invoice });
  } catch (err) {
    console.error('Error marking invoice paid:', err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};

exports.triggerZapier = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: 'Unauthorized' });
    }

    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ message: 'Invoice not found' });
    }

    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: 'Forbidden' });
    }

    return res.send({ message: 'Zap triggered (placeholder logic here).' });
  } catch (error) {
    console.error('Error in triggerZapier:', error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
};
