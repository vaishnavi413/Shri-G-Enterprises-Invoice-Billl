import React from "react";
import InvoiceForm from "../components/InvoiceForm";
import "../App.css";

const InvoicePage = () => {
  return (
    <div className="page-container">
      <InvoiceForm onSave={() => alert("Invoice Saved & Downloaded!")} />
    </div>
  );
};

export default InvoicePage;
