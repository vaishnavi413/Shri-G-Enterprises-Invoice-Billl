import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

// Get next invoice number
router.get("/next-number", async (req, res) => {
  try {
    const last = await Invoice.findOne().sort({ invoiceNo: -1 });
    const nextNumber = last ? last.invoiceNo + 1 : 1;
    res.json({ nextNumber }); // numeric
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all invoices
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice by id
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create invoice (server also normalizes numbers)
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    // Convert numbers safely
    const items = (body.items || []).map(it => ({
      description: it.description || "",
      hsn: it.hsn || "",
      qty: Number(it.qty) || 0,
      rate: Number(it.rate) || 0,
      amount: Number(it.amount) || ((Number(it.qty) || 0) * (Number(it.rate) || 0))
    }));

    const total = items.reduce((s, it) => s + it.amount, 0);
    const gstRate = Number(body.gstRate) || 0;
    const cgst = total * (gstRate / 100);
    const sgst = total * (gstRate / 100);
    const grandTotal = total + cgst + sgst;

    // If invoiceNo not provided, generate
    let invoiceNo = Number(body.invoiceNo);
    if (!invoiceNo || isNaN(invoiceNo)) {
      const last = await Invoice.findOne().sort({ invoiceNo: -1 });
      invoiceNo = last ? last.invoiceNo + 1 : 1;
    }

  const newInvoice = new Invoice({
  customerName,
  address,
  invoiceNumber: invoiceNo, // send invoiceNo as invoiceNumber
  invoiceDate,
  poNo,
  poDate,
  items,
  total,
  cgst,
  sgst,
  grandTotal,
});
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
