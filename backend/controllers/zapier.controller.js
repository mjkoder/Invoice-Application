const Invoice = require("../models/invoice.model");
const User = require("../models/user.model");
const AutomatedRecipient = require("../models/automated.model");

const axios = require("axios");

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

exports.addRecipientToAutomation = async (req, res) => {
    try {
      const { invoiceId } = req.body;
  
      if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
      }
  
      if (!invoiceId) {
        return res.status(400).send({ message: 'Invoice ID is required.' });
      }
  
      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).send({ message: 'Invoice not found.' });
      }
  
      if (invoice.creator.toString() !== req.user._id.toString()) {
        return res.status(403).send({ message: 'Forbidden' });
      }
  
      // Check if already added
      const existing = await AutomatedRecipient.findOne({ invoiceId });
      if (existing) {
        return res.status(400).send({ message: 'Recipient is already automated.' });
      }
  
      // Add recipient to automation
      const automatedRecipient = new AutomatedRecipient({
        invoiceId: invoice._id,
        recipientName: invoice.recipient.name,
        recipientEmail: invoice.recipient.email,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        status: invoice.status,
      });
  
      await automatedRecipient.save();
      res.send({ message: 'Recipient added to automation.' });
    } catch (error) {
      console.error('Error adding recipient to automation:', error);
      res.status(500).send({ message: 'Internal server error.' });
    }
};
  
exports.removeRecipientFromAutomation = async (req, res) => {
try {
    const { invoiceId } = req.body;

    if (!req.user) {
    return res.status(401).send({ message: 'Unauthorized' });
    }

    if (!invoiceId) {
    return res.status(400).send({ message: 'Invoice ID is required.' });
    }

    const removed = await AutomatedRecipient.findOneAndDelete({ invoiceId });
    if (!removed) {
    return res.status(404).send({ message: 'Recipient not found in automation.' });
    }

    res.send({ message: 'Recipient removed from automation.' });
} catch (error) {
    console.error('Error removing recipient from automation:', error);
    res.status(500).send({ message: 'Internal server error.' });
}
};  

exports.scheduleAutomate = async () => {
    try {
      const recipients = await AutomatedRecipient.find({});
      if (!recipients.length) {
        console.log('No automated recipients found.');
        return;
      }
  
      for (const recipient of recipients) {
        const zapPayload = {
          invoiceNumber: recipient.invoiceId,
          recipientName: recipient.recipientName,
          recipientEmail: recipient.recipientEmail,
          amount: recipient.amount,
          dueDate: recipient.dueDate,
          status: recipient.status,
        };
  
        try {
          const response = await axios.post(ZAPIER_WORKING_ZAP_URL, zapPayload);
          if (response.status === 200 || response.status === 201) {
            console.log(`Email reminder sent to ${recipient.recipientEmail}`);
          } else {
            console.error(
              `Failed to send email reminder to ${recipient.recipientEmail}:`,
              response.data
            );
          }
        } catch (error) {
          console.error(
            `Error sending email to ${recipient.recipientEmail}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error('Error in scheduleAutomate:', error);
    }
};
  
exports.getAutomatedRecipients = async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).send({ message: 'Unauthorized' });
      }
  
      const recipients = await AutomatedRecipient.find({});
      res.send(recipients);
    } catch (error) {
      console.error('Error fetching automated recipients:', error);
      res.status(500).send({ message: 'Internal server error.' });
    }
};
  
