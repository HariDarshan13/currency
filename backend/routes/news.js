// routes/news.js
import express from "express";
import News from "../models/News.js";
const router = express.Router();

// GET all news (newest first)
router.get("/", async (req, res) => {
  try {
    const articles = await News.find().sort({ publishedAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single article
router.get("/:id", async (req, res) => {
  try {
    const a = await News.findById(req.params.id);
    if (!a) return res.status(404).json({ error: "Not found" });
    res.json(a);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create article
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    const article = new News(payload);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
  POST /refresh
  This endpoint simulates fetching new articles and storing them.
  Replace the mock generation with a real fetch from a news API if desired.
*/
router.post("/refresh", async (req, res) => {
  try {
    // Example: create 2 new mock articles with current timestamp
    const now = new Date();
    const mocks = [
      {
        title: `Breaking: Market Update ${now.toISOString().slice(0,19).replace("T"," ")}`,
        summary: "Simulated fresh article about market movements.",
        fullContent:
          "Bitcoin is the first and most well-known cryptocurrency in the world. It was created in 2009 by an unknown person or group using the name Satoshi Nakamoto. Unlike traditional money, Bitcoin is not controlled by banks or governments. Instead, it works on a decentralized system where people can send and receive payments directly without middlemen.",
        source: "MockNews API",
        publishedAt: now,
        category: "Bitcoin",
        sentiment: Math.random() > 0.5 ? "bullish" : "bearish",
        url: "",
        readTime: 3,
      },
      {
        title: `Insight: On-chain Signals ${now.getTime()}`,
        summary: "Simulated insight summary about on-chain activity.",
        fullContent:
          "The most famous feature of Ethereum is smart contracts.These are like digital agreements that automatically run when certain conditions are met. This makes Ethereum a flexible and powerful tool for innovation in the crypto space. Just like Bitcoin, Ethereum’s price can change quickly, but it continues to be a key part of the crypto ecosystem.",
        source: "ChainInsights",
        publishedAt: new Date(now.getTime() - 1000 * 60 * 10),
        category: "DeFi",
        sentiment: "neutral",
        url: "",
        readTime: 4,
      },
    ];

    // Save all (could dedupe in real app)
    await News.insertMany(mocks);
    res.status(201).json({ message: "Refreshed", count: mocks.length });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
