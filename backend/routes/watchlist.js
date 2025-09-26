import express from "express";
import Watchlist from "../models/Watchlist.js";

const router = express.Router();

// Get all watchlist
router.get("/", async (req, res) => {
  try {
    let items = await Watchlist.find();
    if (items.length === 0) {
      // Sample data if DB empty
      items = await Watchlist.insertMany([
        { id: Date.now(), name: "Bitcoin", symbol: "BTC", price: 43250.5, change24h: 2.45, marketCap: 850000000000, volume: 32000000000, alerts: [] },
        { id: Date.now() + 1, name: "Ethereum", symbol: "ETH", price: 2650.3, change24h: -1.2, marketCap: 300000000000, volume: 15000000000, alerts: [] },
      ]);
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add coin
router.post("/", async (req, res) => {
  try {
    const newItem = new Watchlist(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete coin
router.delete("/:id", async (req, res) => {
  try {
    await Watchlist.findByIdAndDelete(req.params.id);
    res.json({ message: "Coin removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add alert
router.post("/:id/alerts", async (req, res) => {
  try {
    const { id, type, price, active } = req.body;
    const coin = await Watchlist.findById(req.params.id);
    if (!coin) return res.status(404).json({ error: "Coin not found" });

    coin.alerts.push({ id, type, price, active });
    await coin.save();
    res.json(coin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
