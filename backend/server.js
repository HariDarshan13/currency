import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import holdingsRoutes from "./routes/holdings.js";
import watchlistRouter from "./routes/watchlist.js";
import analyticsRouter from "./routes/analytics.js";
import transactionRouter from "./routes/transaction.js";
import newsRouter from "./routes/news.js";
import authRouter from "./routes/auth.js";
import dotenv from "dotenv";

dotenv.config(); // load variables from .env

const app = express();

// Middleware
app.use(express.json());

// Configure CORS - allow localhost dev origins and allow any origin if FRONTEND_URL env not set
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173"
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps, curl, postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      // allow if FRONTEND_URL env is not set (development friendly)
      if (!process.env.FRONTEND_URL) return callback(null, true);
      return callback(new Error('CORS policy: This origin is not allowed.'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Basic root route to confirm server is running
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Database connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/portfolioDB';
mongoose.connect(MONGO_URI, {
  // these options are default in mongoose v6+, but kept for clarity
})
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/holdings", holdingsRoutes);
app.use("/api/watchlist", watchlistRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/news", newsRouter);
app.use("/api/auth", authRouter);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
