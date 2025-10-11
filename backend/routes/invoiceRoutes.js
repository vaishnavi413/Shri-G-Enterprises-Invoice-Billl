import express from "express";
import Invoice from "../models/Invoice.js";

const router = express.Router();

// --- Get next invoice number ---
router.get("/next-number", async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ invoiceNo: -1 }).exec();
    let nextInvoiceNo = "0001";

    if (lastInvoice) {
      const lastNo = parseInt(lastInvoice.invoiceNo, 10);
      nextInvoiceNo = String(lastNo + 1).padStart(4, "0");
    }

    res.json({ nextInvoiceNo });
  } catch (err) {
    console.error("❌ Error fetching next invoice number:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- Get all invoices ---
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ invoiceNo: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("❌ Error fetching invoices:", err);
    res.status(500).json({ message: "Error fetching invoices" });
  }
});

// --- Get single invoice by invoice number ---
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


// --- Create new invoice ---
router.post("/save", async (req, res) => {
  try {
    const invoiceData = req.body;

    // Ensure numeric fields
    invoiceData.items = (invoiceData.items || []).map((item) => ({
      description: item.description || "",
      hsn: item.hsn || "",
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
      amount:
        Number(item.amount) ||
        (Number(item.qty) || 0) * (Number(item.rate) || 0),
    }));

    invoiceData.total = Number(invoiceData.total) || 0;
    invoiceData.cgst = Number(invoiceData.cgst) || 0;
    invoiceData.sgst = Number(invoiceData.sgst) || 0;
    invoiceData.grandTotal = Number(invoiceData.grandTotal) || 0;

    // Handle duplicate invoice number
    if (invoiceData.invoiceNo) {
      const exists = await Invoice.findOne({ invoiceNo: invoiceData.invoiceNo });
      if (exists) {
        const lastInvoice = await Invoice.findOne().sort({ invoiceNo: -1 });
        invoiceData.invoiceNo = lastInvoice
          ? String(Number(lastInvoice.invoiceNo) + 1).padStart(4, "0")
          : "0001";
      }
    } else {
      const lastInvoice = await Invoice.findOne().sort({ invoiceNo: -1 });
      invoiceData.invoiceNo = lastInvoice
        ? String(Number(lastInvoice.invoiceNo) + 1).padStart(4, "0")
        : "0001";
    }

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    res
      .status(201)
      .json({ message: "Invoice saved successfully", invoice: newInvoice });
  } catch (err) {
    console.error("❌ Error saving invoice:", err);
    res.status(500).json({ error: "Failed to save invoice" });
  }
});

export default router;
