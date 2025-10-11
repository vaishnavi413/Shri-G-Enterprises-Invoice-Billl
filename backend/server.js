// -------------------------------
// ✅ IMPORTS
// -------------------------------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import invoiceRoutes from "./routes/invoiceRoutes.js";

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

// Default route
app.get("/", (req, res) => {
  res.send("Server is running successfully ✅");
});

// Invoice routes
app.use("/api/invoices", invoiceRoutes);

// -------------------------------
// ✅ START SERVER
// -------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
