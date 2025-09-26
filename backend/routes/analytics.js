import express from "express";

const router = express.Router();

// Mock analytics API
router.get("/", (req, res) => {
  const chartData = [
    { time: "Day 1", price: 42000, low: 41500, high: 42500 },
    { time: "Day 2", price: 43000, low: 42000, high: 43500 },
    { time: "Day 3", price: 44000, low: 43000, high: 44500 }
  ];

  const comparisonData = [
    { time: "Day 1", BTC: 42000, ETH: 2800 },
    { time: "Day 2", BTC: 43000, ETH: 2900 },
    { time: "Day 3", BTC: 44000, ETH: 3000 }
  ];

  res.json({ chartData, comparisonData });
});

export default router;
