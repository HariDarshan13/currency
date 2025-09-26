// models/News.js
import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  fullContent: { type: String }, // optional long-form content
  source: { type: String, default: "Unknown" },
  publishedAt: { type: Date, default: Date.now },
  category: { type: String, default: "General" },
  sentiment: { type: String, enum: ["bullish", "bearish", "neutral"], default: "neutral" },
  imageUrl: { type: String },
  url: { type: String },
  readTime: { type: Number, default: 3 }
}, { timestamps: true });

export default mongoose.models.News || mongoose.model("News", NewsSchema);
