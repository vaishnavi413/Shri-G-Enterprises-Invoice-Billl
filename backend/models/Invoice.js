import mongoose from "mongoose";

// Item sub-schema
const itemSchema = new mongoose.Schema({
  description: String,
  hsn: String,
  qty: Number,
  rate: Number,
  amount: Number,
});

// Invoice schema
const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true }, // String, but numeric value stored as string
    customerName: { type: String, required: true },
    address: String,
    invoiceDate: String,
    poNo: String,
    poDate: String,
    items: [itemSchema],
    total: Number,
    cgst: Number,
    sgst: Number,
    grandTotal: Number,
    notes: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
