import React, { useEffect, useState } from "react";
import axios from "axios";
import InvoiceForm from "./InvoiceForm"; // import your existing invoice component
import "./PreviousInvoicePage.css"; // optional styling

function PreviousInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceList, setShowInvoiceList] = useState(true);

  // Fetch all invoices from the backend
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/invoices"); // your backend API route
        setInvoices(res.data);
      } catch (err) {
        console.error("Error fetching invoices:", err);
      }
    };

    fetchInvoices();
  }, []);

  // View selected invoice
  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceList(false);
  };

  // Go back to list view
  const handleBack = () => {
    setSelectedInvoice(null);
    setShowInvoiceList(true);
  };

  return (
    <div className="previous-invoice-page">
      {showInvoiceList ? (
        <div>
          <h2>Previous Invoices</h2>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer Name</th>
                <th>Invoice Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>{inv.invoiceNo}</td>
                    <td>{inv.customerName}</td>
                    <td>{inv.invoiceDate}</td>
                    <td>{inv.totalAmount}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => handleView(inv)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          <InvoiceForm
            isViewMode={true}
            existingInvoice={selectedInvoice}
            onBack={handleBack}
          />
        </div>
      )}
    </div>
  );
}

export default PreviousInvoicePage;
