import express from "express";
import Holding from "../models/Holding.js";

const router = express.Router();

// GET all holdings
router.get("/", async (req, res) => {
  try {
    const holdings = await Holding.find();
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new holding
router.post("/", async (req, res) => {
  try {
    const holding = new Holding(req.body);
    await holding.save();
    res.json(holding);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE holding by ID
router.delete("/:id", async (req, res) => {
  try {
    await Holding.findByIdAndDelete(req.params.id);
    res.json({ message: "Holding deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
