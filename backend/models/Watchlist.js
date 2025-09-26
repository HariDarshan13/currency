import mongoose from "mongoose";

const AlertSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  type: { type: String, enum: ["above", "below"], required: true },
  price: { type: Number, required: true },
  active: { type: Boolean, default: true },
}, { _id: false });

const WatchlistSchema = new mongoose.Schema({
  id: { type: Number, required: true },         // frontend Date.now()
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  price: { type: Number, required: true },
  change24h: { type: Number, default: 0 },
  marketCap: { type: Number, default: 0 },
  volume: { type: Number, default: 0 },
  alerts: { type: [AlertSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("Watchlist", WatchlistSchema);
