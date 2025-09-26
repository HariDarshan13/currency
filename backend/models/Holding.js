import mongoose from "mongoose";

const HoldingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    amount: { type: Number, required: true },
    avgPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },

    // Now persisted in DB
    value: { type: Number },
    gainLoss: { type: Number },
    gainLossPercent: { type: Number },
  },
  { timestamps: true }
);

// Pre-save hook to auto-calc values before saving
HoldingSchema.pre("save", function (next) {
  this.value = this.amount * this.currentPrice;
  this.gainLoss = (this.currentPrice - this.avgPrice) * this.amount;
  this.gainLossPercent =
    this.avgPrice > 0
      ? ((this.currentPrice - this.avgPrice) / this.avgPrice) * 100
      : 0;
  next();
});

export default mongoose.model("Holding", HoldingSchema);
