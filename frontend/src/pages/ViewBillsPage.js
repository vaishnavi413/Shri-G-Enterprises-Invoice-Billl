import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewBillsPage.css";

function ViewBillsPage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      const res = await axios.get("http://localhost:5000/api/invoices");
      setInvoices(res.data);
    };
    fetchInvoices();
  }, []);

  const viewInvoice = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/invoices/${id}`);
    setSelectedInvoice(res.data);
  };

  return (
    <div className="view-bills">
      {!selectedInvoice ? (
        <>
          <h2>📜 Previous Bills</h2>
          <table className="bills-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Invoice No</th>
                <th>Invoice Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.customerName}</td>
                  <td>{inv.invoiceNo}</td>
                  <td>{inv.invoiceDate}</td>
                  <td><button onClick={() => viewInvoice(inv._id)}>👁️ View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div className="invoice-preview">
          <h3>Invoice No: {selectedInvoice.invoiceNo}</h3>
          <p><b>Customer:</b> {selectedInvoice.customerName}</p>
          <p><b>Address:</b> {selectedInvoice.address}</p>
          <button onClick={() => setSelectedInvoice(null)}>🔙 Back</button>
        </div>
      )}
    </div>
  );
}

export default ViewBillsPage;
