import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/logo.jpeg";
import "../components/InvoiceForm.css"; // reuse same styling

export default function InvoiceView() {
  const { id } = useParams();
  const [inv, setInv] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/invoices/${id}`);
        setInv(res.data);
      } catch (err) { console.error(err); }
    };
    load();
  }, [id]);

  const downloadPDF = async () => {
    const node = document.getElementById("invoice-pdf");
    if (!node) return;
    const canvas = await html2canvas(node, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${String(inv.invoiceNo).padStart(3,"0")}.pdf`);
  };

  if (!inv) return <div>Loading...</div>;

  return (
    <div id="invoice-pdf" style={{ padding: 20 }}>
      <div style={{ textAlign: "center" }}>
        <img src={logo} alt="logo" style={{ width: 80 }} />
        <h2>SHRI G ENTERPRISES</h2>
        <div>Welding & Safety Equipment’s</div>
      </div>

      <div style={{ marginTop: 10 }}>
        <b>Invoice No:</b> {String(inv.invoiceNo).padStart(3,"0")} &nbsp;&nbsp;
        <b>Date:</b> {inv.invoiceDate}
      </div>

      <div style={{ marginTop: 10 }}>
        <b>To:</b> {inv.customerName}<br />
        <div>{inv.address}</div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #000" }}>SR</th>
            <th style={{ border: "1px solid #000" }}>DESCRIPTION</th>
            <th style={{ border: "1px solid #000" }}>HSN</th>
            <th style={{ border: "1px solid #000" }}>QTY</th>
            <th style={{ border: "1px solid #000" }}>RATE</th>
            <th style={{ border: "1px solid #000" }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {inv.items.map((it, i) => (
            <tr key={i}>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>{i+1}</td>
              <td style={{ border: "1px solid #000" }}>{it.description}</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>{it.hsn}</td>
              <td style={{ border: "1px solid #000", textAlign: "center" }}>{it.qty}</td>
              <td style={{ border: "1px solid #000", textAlign: "right" }}>{it.rate.toFixed(2)}</td>
              <td style={{ border: "1px solid #000", textAlign: "right" }}>{it.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12, width: "40%", float: "right" }}>
        <div style={{ border: "1px solid #000", padding: 6 }}>
          <div><b>Total:</b> ₹{inv.total.toFixed(2)}</div>
          <div><b>CGST ({inv.gstRate}%):</b> ₹{inv.cgst.toFixed(2)}</div>
          <div><b>SGST ({inv.gstRate}%):</b> ₹{inv.sgst.toFixed(2)}</div>
          <div style={{ fontWeight: "bold" }}><b>Grand Total:</b> ₹{inv.grandTotal.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ clear: "both", marginTop: 20 }}>
        <button onClick={downloadPDF}>⬇️ Download PDF</button>
      </div>
    </div>
  );
}
