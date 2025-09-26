import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["buy", "sell"], required: true },
  cryptocurrency: { type: String, required: true },
  symbol: { type: String, required: true },
  amount: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  date: { type: Date, required: true },
  exchange: { type: String },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model("Transaction", TransactionSchema);
