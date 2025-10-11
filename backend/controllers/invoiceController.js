// controllers/invoiceController.js
import Invoice from "../models/Invoice.js";
import Counter from "../models/Counter.js";
import formatInvoiceNumber from "../utils/formatInvoiceNumber.js";
import { generatePdfBuffer } from "../utils/pdfGenerator.js";

/**
 * Save a draft (no seq assigned)
 * POST /api/invoices/draft
 */
export const saveDraft = async (req, res) => {
  try {
    const data = req.body;
    const draft = new Invoice({ ...data, finalized: false });
    await draft.save();
    res.status(201).json(draft);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Finalize invoice (assign seq atomically) 
 * POST /api/invoices/finalize
 * body: { draftId?, invoiceData }
 */
export const finalizeInvoice = async (req, res) => {
  try {
    const { draftId, invoiceData } = req.body;
    let invoice;

    if (draftId) {
      invoice = await Invoice.findById(draftId);
      if (!invoice) return res.status(404).json({ message: "Draft not found" });
      if (invoice.finalized) return res.json(invoice); // already finalized -> idempotent
      Object.assign(invoice, invoiceData || {});
    } else {
      invoice = new Invoice(invoiceData);
    }

    // Atomic counter increment
    const counter = await Counter.findOneAndUpdate(
      { _id: "invoiceCounter" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    invoice.seq = counter.seq;
    invoice.number = formatInvoiceNumber(counter.seq);
    invoice.finalized = true;
    invoice.finalizedAt = new Date();

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    console.error("finalizeInvoice error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * List invoices with optional search & pagination
 * GET /api/invoices?search=&page=1&limit=50
 */
export const listInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const q = {};
    if (search) q["customer.name"] = new RegExp(search, "i");
    const skip = (page - 1) * limit;
    const total = await Invoice.countDocuments(q);
    const invoices = await Invoice.find(q).sort({ createdAt: -1 }).skip(skip).limit(+limit);
    res.json({ total, page: +page, invoices });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get one invoice
 * GET /api/invoices/:id
 */
export const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Download generated PDF
 * GET /api/invoices/:id/download
 */
export const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const pdfBuffer = await generatePdfBuffer(invoice);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number || invoice._id}.pdf"`
    });
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
