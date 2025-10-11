import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

// --- GET next invoice number ---
router.get("/next-number", async (req, res) => {
  try {
    const last = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;

    if (last && last.invoiceNo) {
      const lastNum = parseInt(last.invoiceNo, 10);
      nextNumber = isNaN(lastNum) ? 1 : lastNum + 1;
    }

    res.json({ nextNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET all invoices ---
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GET single invoice by ID ---
router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- CREATE new invoice ---
router.post("/", async (req, res) => {
  try {
    const {
      invoiceNo,
      customerName,
      address,
      invoiceDate,
      poNo,
      poDate,
      items = [],
      gstRate = 0,
      notes = [],
    } = req.body;

    // Calculate totals
    const normalizedItems = items.map((it) => ({
      description: it.description || "",
      hsn: it.hsn || "",
      qty: Number(it.qty) || 0,
      rate: Number(it.rate) || 0,
      amount: Number(it.amount) || (Number(it.qty) || 0) * (Number(it.rate) || 0),
    }));

    const total = normalizedItems.reduce((sum, it) => sum + it.amount, 0);
    const cgst = total * (gstRate / 100);
    const sgst = total * (gstRate / 100);
    const grandTotal = total + cgst + sgst;

    // Generate invoice number if not provided
    let finalInvoiceNo = invoiceNo;
    if (!finalInvoiceNo) {
      const last = await Invoice.findOne().sort({ createdAt: -1 });
      const nextNumber =
        last && !isNaN(parseInt(last.invoiceNo, 10))
          ? parseInt(last.invoiceNo, 10) + 1
          : 1;
      finalInvoiceNo = nextNumber.toString();
    }

    const newInvoice = new Invoice({
      invoiceNo: finalInvoiceNo,
      customerName,
      address,
      invoiceDate,
      poNo,
      poDate,
      items: normalizedItems,
      total,
      cgst,
      sgst,
      grandTotal,
      notes,
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
