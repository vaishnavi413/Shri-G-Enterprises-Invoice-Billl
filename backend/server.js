// -------------------------------
// ✅ IMPORTS
// -------------------------------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Invoice from "./models/Invoice.js"; // import model

// -------------------------------
// ✅ CONFIGURATION
// -------------------------------
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// -------------------------------
// ✅ DATABASE CONNECTION
// -------------------------------
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/invoiceDB";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// -------------------------------
// ✅ ROUTES
// -------------------------------

// 🔹 Default route
app.get("/", (req, res) => {
  res.send("Server is running successfully ✅");
});

// 🔹 Get latest invoice number
app.get("/api/invoices/latest", async (req, res) => {
  try {
    const latestInvoice = await Invoice.findOne().sort({ invoiceNo: -1 }).exec();
    let nextInvoiceNo = "0001";
    if (latestInvoice) {
      const lastNo = parseInt(latestInvoice.invoiceNo, 10);
      nextInvoiceNo = String(lastNo + 1).padStart(4, "0");
    }
    res.json({ nextInvoiceNo });
  } catch (error) {
    console.error("❌ Error fetching latest invoice:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 Save new invoice
app.post("/api/invoices/save", async (req, res) => {
  try {
    let invoiceData = req.body;

    // Ensure numeric fields
    invoiceData.items = invoiceData.items.map((item) => ({
      description: item.description || "",
      hsn: item.hsn || "",
      qty: Number(item.qty) || 0,
      rate: Number(item.rate) || 0,
      amount: Number(item.amount) || 0,
    }));

    invoiceData.total = Number(invoiceData.total) || 0;
    invoiceData.cgst = Number(invoiceData.cgst) || 0;
    invoiceData.sgst = Number(invoiceData.sgst) || 0;
    invoiceData.grandTotal = Number(invoiceData.grandTotal) || 0;

    // Increment invoice number if duplicate
    const exists = await Invoice.findOne({ invoiceNo: invoiceData.invoiceNo });
    if (exists) {
      const lastInvoice = await Invoice.findOne().sort({ invoiceNo: -1 });
      invoiceData.invoiceNo = lastInvoice
        ? String(Number(lastInvoice.invoiceNo) + 1).padStart(4, "0")
        : "0001";
    }

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();

    res.status(201).json({ message: "Invoice saved successfully", invoice: newInvoice });
  } catch (error) {
    console.error("❌ Error saving invoice:", error);
    res.status(500).json({ error: "Failed to save invoice" });
  }
});

// 🔹 Get all invoices (for previous bill list)
app.get("/api/invoices/all", async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ invoiceNo: -1 });
    res.json(invoices);
  } catch (err) {
    console.error("❌ Error fetching invoices:", err);
    res.status(500).json({ message: "Error fetching invoices" });
  }
});

// 🔹 Get single invoice by invoice number (for “View” button)
app.get("/api/invoices/view/:invoiceNo", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNo: req.params.invoiceNo });
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }
    res.json(invoice);
  } catch (err) {
    console.error("❌ Error fetching invoice:", err);
    res.status(500).json({ message: "Error fetching invoice" });
  }
});

// -------------------------------
// ✅ START SERVER
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
