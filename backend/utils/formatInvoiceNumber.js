// utils/formatInvoiceNumber.js
export default function formatInvoiceNumber(seq) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(seq).padStart(4, "0")}`; // INV-2025-0001
}
