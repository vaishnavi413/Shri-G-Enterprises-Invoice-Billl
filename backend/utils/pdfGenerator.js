// utils/pdfGenerator.js
import PDFDocument from "pdfkit";

export const generatePdfBuffer = (invoice) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    // Header
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    // Meta
    doc.fontSize(12).text(`Invoice No: ${invoice.number}`);
    doc.text(`Date: ${invoice.finalizedAt ? new Date(invoice.finalizedAt).toLocaleDateString() : new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // Customer
    doc.fontSize(12).text(`Customer: ${invoice.customer?.name || ""}`);
    if (invoice.customer?.address) doc.text(`Address: ${invoice.customer.address}`);
    if (invoice.customer?.phone) doc.text(`Phone: ${invoice.customer.phone}`);
    if (invoice.customer?.email) doc.text(`Email: ${invoice.customer.email}`);
    doc.moveDown();

    // Items header
    doc.text("Items:", { underline: true });
    doc.moveDown(0.3);

    // Items table-like
    invoice.items.forEach((it, idx) => {
      doc.text(`${idx + 1}. ${it.description}`);
      doc.text(`   Qty: ${it.qty}   Rate: ${it.rate}   Total: ${it.total}`);
      doc.moveDown(0.2);
    });

    doc.moveDown();
    doc.text(`Subtotal: ${invoice.subtotal ?? 0}`);
    doc.text(`Tax (${invoice.taxPercent ?? 0}%): ${invoice.taxAmount ?? 0}`);
    doc.text(`Total: ${invoice.total ?? 0}`, { underline: true });

    if (invoice.notes) {
      doc.moveDown();
      doc.text("Notes:");
      doc.text(invoice.notes);
    }

    doc.end();
  });
};
