import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { PlusCircle, Filter, Zap } from "lucide-react";

const InvoicePage = ({ currentUser }) => {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Create Invoice form fields
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [status, setStatus] = useState("Due"); // Default value aligned with model

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/invoices?`;
      if (statusFilter) {
        url += `status=${statusFilter}&`;
      }
      if (sortOrder) {
        url += `sort=${sortOrder}`;
      }
      const response = await axios.get(url, { withCredentials: true });
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  }, [statusFilter, sortOrder]);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      fetchInvoices();
    }
  }, [currentUser, fetchInvoices]);

  if (!currentUser || !currentUser._id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold animate-bounce">
          Please log in to view your invoices.
        </h2>
        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => (window.location.href = "/")}
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/invoices`,
        {
          invoiceNumber,
          amount,
          dueDate,
          recipientName,
          recipientPhone,
          recipientEmail,
          recipientAddress,
          status,
        },
        { withCredentials: true }
      );
      setShowForm(false);
      setInvoiceNumber("");
      setAmount("");
      setDueDate("");
      setRecipientName("");
      setRecipientPhone("");
      setRecipientEmail("");
      setRecipientAddress("");
      setStatus("Due");
      fetchInvoices();
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert(error.response?.data?.error || "Error creating invoice");
    }
  };

  const handleTriggerZap = async (invoiceId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/invoices/trigger-zap`,
        { invoiceId },
        { withCredentials: true }
      );
      alert("Zap Triggered!");
    } catch (error) {
      console.error("Error triggering Zap:", error);
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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Invoices</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <PlusCircle size={18} className="mr-2" />
            Create Invoice
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">All Statuses</option>
              <option value="Due">Due</option>
              <option value="Overdue">Overdue</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Create Invoice form */}
        {showForm && (
          <form
            onSubmit={handleCreateInvoice}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 p-4 border rounded"
          >
            <input
              type="text"
              className="border p-2 rounded"
              placeholder="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />
            <input
              type="number"
              className="border p-2 rounded"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <input
              type="date"
              className="border p-2 rounded"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <input
              type="text"
              className="border p-2 rounded"
              placeholder="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              required
            />
            <input
              type="text"
              className="border p-2 rounded"
              placeholder="Recipient Phone"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              required
            />
            <input
              type="email"
              className="border p-2 rounded"
              placeholder="Recipient Email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              required
            />
            <input
              type="text"
              className="border p-2 rounded col-span-full"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded"
              required
            >
              <option value="Due">Due</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button
              type="submit"
              className="col-span-full bg-yellow-400 text-white py-2 rounded hover:bg-yellow-500"
            >
              Save Invoice
            </button>
          </form>
        )}

        {/* Table of invoices */}
        {invoices.length === 0 ? (
          <p>No invoices found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse text-center">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-4 border-b">Invoice</th>
                  <th className="p-4 border-b">Recipient Name</th>
                  <th className="p-4 border-b">Recipient Email</th>
                  <th className="p-4 border-b">Amount</th>
                  <th className="p-4 border-b">Due Date</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50">
                    <td className="p-4 border-b align-middle">
                      #{inv.invoiceNumber}
                    </td>
                    <td className="p-4 border-b align-middle">
                      {inv.recipient?.name || "Unknown"}
                    </td>
                    <td className="p-4 border-b align-middle">
                      {inv.recipient?.email || "No Email"}
                    </td>
                    <td className="p-4 border-b align-middle">${inv.amount}</td>
                    <td className="p-4 border-b align-middle">
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

                    <td className="p-4 border-b align-middle">
                      {inv.status !== "Paid" && (
                        <button
                          onClick={() => handleTriggerZap(inv._id)}
                          className="flex items-center justify-center bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                        >
                          <Zap size={14} className="mr-1" />
                          Trigger Zap
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePage;
