import React, { useState, useEffect } from "react";

function ServicePage() {
  const [invoiceData, setInvoiceData] = useState({
    customerName: "",
    date: "",
    amount: "",
    description: "",
  });
  const [invoiceNumber, setInvoiceNumber] = useState(1);

  useEffect(() => {
    // TODO: Fetch next invoice number from backend
    // For now, it starts at 1
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Invoice #${invoiceNumber} saved!`);
    setInvoiceData({
      customerName: "",
      date: "",
      amount: "",
      description: "",
    });
    setInvoiceNumber(invoiceNumber + 1);
  };

  return (
    <div className="form-container">
        <h4 class="center-text">Tax Invoice</h4>

        <h1>Shri G Enterprises</h1>
      <h2>Create Invoice #{invoiceNumber}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={invoiceData.customerName}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="date"
          value={invoiceData.date}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={invoiceData.amount}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={invoiceData.description}
          onChange={handleChange}
        ></textarea>
        <button type="submit">Save & Generate Invoice</button>
      </form>
    </div>
  );
}

export default ServicePage;
