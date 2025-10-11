// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import InvoiceForm from "./components/InvoiceForm";
import PreviousInvoicePage from "./components/PreviousInvoicePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<InvoiceForm />} />
        <Route path="/previous-invoices/:invoiceNo" element={<PreviousInvoicePage />} />
      </Routes>
    </Router>
  );
}

export default App;
