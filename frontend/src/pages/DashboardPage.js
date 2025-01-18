import React, { useState, useEffect, useCallback } from "react";
import { Edit, Printer, CheckCircle } from "lucide-react";
import axios from "axios";

const DashboardPage = ({ currentUser }) => {
  const [dueInvoices, setDueInvoices] = useState([]);
  const [paidInvoices, setPaidInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const res1 = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/invoices?sort=desc`,
        {
          withCredentials: true,
        }
      );
      const all = res1.data;
      const unPaid = all.filter(
        (inv) => inv.status === "Due" || inv.status === "Overdue"
      );
      const paid = all.filter((inv) => inv.status === "Paid");
      setDueInvoices(unPaid);
      setPaidInvoices(paid);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchInvoices();
    }
  }, [currentUser, fetchInvoices]);

  const updateDueDate = async (invoiceId) => {
    const newDate = prompt("Enter new due date (YYYY-MM-DD)");
    if (!newDate) return;
    try {
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/invoices/${invoiceId}`,
        { dueDate: newDate },
        { withCredentials: true }
      );
      fetchInvoices();
    } catch (error) {
      console.error("Error updating due date:", error);
    }
  };

  const markAsPaid = async (invoiceId) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/invoices/${invoiceId}`,
        { markPaid: true },
        { withCredentials: true }
      );
      fetchInvoices();
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-600";
      case "Due":
        return "bg-yellow-100 text-yellow-600";
      case "Overdue":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleHover = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleHoverOut = () => {
    setSelectedInvoice(null);
  };

  const handlePrint = (invoicesToPrint, tableName) => {
    const today = new Date().toLocaleDateString();
    const printContent = `
      <html>
      <head>
        <style>
          @page {
            margin: 0;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .title {
            text-align: center;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <h2 class="title">${tableName} (as of ${today})</h2>
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Recipient Name</th>
              <th>Recipient Email</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${invoicesToPrint
              .map(
                (inv) => `
              <tr>
                <td>${inv.invoiceNumber}</td>
                <td>${inv.recipient.name}</td>
                <td>${inv.recipient.email}</td>
                <td>$${inv.amount}</td>
                <td>${new Date(inv.dueDate).toLocaleDateString()}</td>
                <td>${inv.status}</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const newWindow = window.open("", "_blank");
    newWindow.document.write(printContent);

    // pdf content loads before printing
    setTimeout(() => {
      newWindow.print();
      newWindow.close();
    }, 100);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-md p-4 mb-6">
        <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
        <p className="text-gray-700">Email: {currentUser.email}</p>
        {/* <p className="text-gray-700">Phone: {currentUser.phone || "N/A"}</p> */}
      </div>

      {/* Due & Overdue Invoices */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Due & Overdue Invoices</h3>
          <button
            onClick={() => handlePrint(dueInvoices, "Due & Overdue Invoices")}
            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded flex items-center space-x-2"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
        <table className="table-auto w-full border-collapse text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 border-b">Invoice</th>
              <th className="p-4 border-b">Amount</th>
              <th className="p-4 border-b">Due Date</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dueInvoices.map((inv) => (
              <tr
                key={inv._id}
                className="hover:bg-gray-100 relative"
                onMouseEnter={() => handleHover(inv)}
                onMouseLeave={handleHoverOut}
              >
                <td className="p-4 border-b">#{inv.invoiceNumber}</td>
                <td className="p-4 border-b">${inv.amount}</td>
                <td className="p-4 border-b">
                  {new Date(inv.dueDate).toLocaleDateString()}
                </td>
                <td className="p-4 border-b align-middle">
                  <span
                    className={`inline-flex items-center justify-center w-24 h-8 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      inv.status
                    )}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 border-b space-x-2">
                  <button
                    onClick={() => updateDueDate(inv._id)}
                    className="inline-flex items-center bg-blue-500 text-white px-2 py-1 text-sm rounded hover:bg-blue-600"
                  >
                    <Edit size={14} className="mr-1" />
                    Update Due
                  </button>
                  <button
                    onClick={() => markAsPaid(inv._id)}
                    className="inline-flex items-center bg-green-500 text-white px-2 py-1 text-sm rounded hover:bg-green-600"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    Mark Paid
                  </button>
                </td>
                {selectedInvoice && selectedInvoice._id === inv._id && (
                  <div className="absolute top-full left-0 bg-gray-50 border rounded shadow-lg w-full z-10 p-4">
                    <p>
                      <strong>Recipient Name:</strong>{" "}
                      {selectedInvoice.recipient.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedInvoice.recipient.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedInvoice.recipient.phone}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedInvoice.recipient.address}
                    </p>
                  </div>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paid Invoices */}
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Paid Invoices</h3>
          <button
            onClick={() => handlePrint(paidInvoices, "Paid Invoices")}
            className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded flex items-center space-x-2"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
        <table className="table-auto w-full border-collapse text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-4 border-b">Invoice</th>
              <th className="p-4 border-b">Amount</th>
              <th className="p-4 border-b">Due Date</th>
              <th className="p-4 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {paidInvoices.map((inv) => (
              <tr
                key={inv._id}
                className="hover:bg-gray-100 relative"
                onMouseEnter={() => handleHover(inv)}
                onMouseLeave={handleHoverOut}
              >
                <td className="p-4 border-b">#{inv.invoiceNumber}</td>
                <td className="p-4 border-b">${inv.amount}</td>
                <td className="p-4 border-b">
                  {new Date(inv.dueDate).toLocaleDateString()}
                </td>
                <td className="p-4 border-b align-middle">
                  <span
                    className={`inline-flex items-center justify-center w-24 h-8 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      inv.status
                    )}`}
                  >
                    {inv.status}
                  </span>
                </td>
                {selectedInvoice && selectedInvoice._id === inv._id && (
                  <div className="absolute top-full left-0 bg-gray-50 border rounded shadow-lg w-full z-10 p-4">
                    <p>
                      <strong>Recipient Name:</strong>{" "}
                      {selectedInvoice.recipient.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedInvoice.recipient.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedInvoice.recipient.phone}
                    </p>
                    <p>
                      <strong>Address:</strong>{" "}
                      {selectedInvoice.recipient.address}
                    </p>
                  </div>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
