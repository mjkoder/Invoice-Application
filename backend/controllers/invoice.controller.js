const Invoice = require("../models/invoice.model");
const User = require("../models/user.model");
const axios = require("axios");

exports.getInvoices = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const { status, sort } = req.query;

    let query = { creator: req.user._id };

    if (status && status !== "all") {
      query.status = status;
    }

    let sortObj = { createdAt: -1 };
    if (sort === "asc") {
      sortObj = { createdAt: 1 };
    }

    const invoices = await Invoice.find(query).sort(sortObj);

    for (let invoice of invoices) {
      if (invoice.status !== "Paid" && invoice.dueDate < new Date()) {
        invoice.status = "Overdue";
        await invoice.save();
      }
    }

    return res.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
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
      status: status || "Due",
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
    console.error("Error creating invoice:", error);
    if (error.code === 11000) {
      // for duplicate check
      return res.status(400).json({
        error:
          "Invoice number already exists for this user. Please use a different invoice number.",
      });
    }
    res.status(500).send({ error: "Internal server error" });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const { invoiceId } = req.params;
    const { markPaid, dueDate } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ message: "Invoice not found" });
    }

    // Check ownership
    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Forbidden" });
    }

    if (invoice.status === "Paid" && (markPaid || dueDate)) {
      return res.status(400).send({
        message: "Invoice is already paid and cannot be modified.",
      });
    }

    if (markPaid) {
      invoice.status = "Paid";
    }

    if (dueDate) {
      invoice.dueDate = dueDate;
    }

    if (invoice.status !== "Paid" && invoice.dueDate < new Date()) {
      invoice.status = "Overdue";
    }

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    res.status(500).send({ message: "Internal server error" });
  }
};

exports.markInvoicePaid = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { enteredEmail } = req.body;

    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ message: "Invoice not found" });
    }

    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Forbidden" });
    }

    if (invoice.status === "Paid") {
      return res.status(400).send({ message: "Invoice is already paid." });
    }

    if (invoice.recipient.email !== enteredEmail) {
      return res.status(400).send({ message: "Recipient email mismatch." });
    }

    // Mark as paid
    invoice.status = "Paid";
    await invoice.save();

    res.json({ message: "Invoice marked as paid.", invoice });
  } catch (err) {
    console.error("Error marking invoice paid:", err);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

const ZAPIER_WEBHOOK_URL = process.env.ZAPIER_WEBHOOK_URL;
exports.triggerZapier = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const { invoiceId } = req.body;
    if (!invoiceId) {
      return res.status(400).send({ message: "Invoice ID is required." });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).send({ message: "Invoice not found" });
    }

    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const currentDate = new Date();
    if (invoice.status !== "Paid") {
      if (invoice.dueDate <= currentDate && invoice.dueDate !== "Overdue") {
        invoice.status = "Overdue";
      } else {
        invoice.status = "Due";
      }
      await invoice.save();
    }

    // Payload for Zapier
    const zapPayload = {
      invoiceNumber: invoice.invoiceNumber,
      recipientName: invoice.recipient.name,
      recipientEmail: invoice.recipient.email,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
      createdAt: invoice.createdAt,
    };

    console.log("Zapier Payload:", zapPayload);

    if (!ZAPIER_WEBHOOK_URL) {
      console.error("Zapier webhook URL is not configured.");
      return res
        .status(500)
        .send({ message: "Zapier webhook URL not configured." });
    }

    const zapResponse = await axios.post(ZAPIER_WEBHOOK_URL, zapPayload);

    if (zapResponse.status === 200 || zapResponse.status === 201) {
      return res.send({ message: "Zap successfully triggered." });
    } else {
      console.error(
        "Unexpected response from Zapier:",
        zapResponse.status,
        zapResponse.data
      );
      return res.status(500).send({ message: "Failed to trigger Zap." });
    }
  } catch (error) {
    console.error("Error in triggerZapier:", error);
    if (error.response) {
      return res
        .status(500)
        .send({
          message: "Zapier responded with an error.",
          details: error.response.data,
        });
    } else if (error.request) {
      return res.status(500).send({ message: "No response from Zapier." });
    } else {
      return res.status(500).send({ message: "Failed to trigger Zap." });
    }
  }
};

exports.automateReminder = async (req, res) => {
  console.log("1");
  try {
    console.log("2");
    const { invoiceId } = req.body;

    if (!req.user) {
      return res.status(401).send({ message: "Unauthorized" });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).send({ message: "Invoice not found" });
    }

    if (invoice.creator.toString() !== req.user._id.toString()) {
      return res.status(403).send({ message: "Forbidden" });
    }

    const zapPayload = {
      invoiceNumber: invoice.invoiceNumber,
      recipientName: invoice.recipient.name,
      recipientEmail: invoice.recipient.email,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      status: invoice.status,
    };

    console.log("Enabling automation for:", zapPayload);

    if (!ZAPIER_WEBHOOK_URL) {
      return res
        .status(500)
        .send({ message: "Zapier webhook URL not configured." });
    }

    await axios.post(ZAPIER_WEBHOOK_URL, zapPayload);

    res.send({ message: "Automation enabled for hourly reminders." });
  } catch (error) {
    console.log("3");
    console.error("Error enabling automation:", error);
    res.status(500).send({ message: "Failed to enable automation." });
  }
};
