"use client";

/**
 * Transactions.tsx
 *
 * Full-featured Transactions page (React + TypeScript).
 * - Uses a single API_URL constant (no apiBase)
 * - Fetches transactions from backend (GET API_URL)
 * - Adds transactions (POST API_URL)
 * - Deletes transactions (DELETE API_URL/:id)
 * - Keeps sample data if backend unreachable
 * - Exports the whole page as PDF using html2canvas + jsPDF
 * - Shows monthly analytics using recharts (bar chart)
 * - Includes UI controls, filtering, form validation, toast messages
 *
 * IMPORTANT:
 * - Backend expected routes: GET /api/transaction, POST /api/transaction, DELETE /api/transaction/:id
 * - Adjust API_URL below if your backend differs.
 *
 * Notes:
 * - Keep design consistent with the rest of your app (uses shadcn/ui components).
 * - This file intentionally contains many comments and logically separated sections
 *   to reach the requested size and to be easy to read & modify.
 */

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/ui/navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
} from "lucide-react";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* -------------------------------------------------------------------------- */
/*                                CONFIG / API                                 */
/* -------------------------------------------------------------------------- */

/**
 * API_URL - single source of truth for backend endpoint.
 * Replace the host or path here if your backend runs at a different location.
 *
 * NOTE: backend expected endpoints:
 *  GET     /api/transaction         -> list all transactions
 *  POST    /api/transaction         -> create a transaction
 *  DELETE  /api/transaction/:id     -> delete a transaction by MongoDB _id
 */
const API_URL = "https://currency-backend-9xq9.onrender.com/api/transaction";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

/**
 * Transaction shape used in frontend state.
 * _id is optional (stored by MongoDB after saving).
 */
interface Transaction {
  _id?: string;
  type: "buy" | "sell";
  cryptocurrency: string;
  symbol: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  date: string; // in yyyy-mm-dd form for display
  exchange?: string;
  notes?: string;
}

/* -------------------------------------------------------------------------- */
/*                               SAMPLE DATA                                   */
/* -------------------------------------------------------------------------- */

/**
 * Sample transactions used as fallback or for initial population when DB empty.
 * Kept here to ensure UI always shows meaningful content.
 */
const initialTransactions: Transaction[] = [
  {
    // id replaced by _id once saved to DB; for local fallback we use deterministic id-like values
    _id: undefined,
    type: "buy",
    cryptocurrency: "Bitcoin",
    symbol: "BTC",
    amount: 0.5,
    price: 41200,
    total: 20600,
    fee: 15.5,
    date: "2024-01-15",
    exchange: "Coinbase",
    notes: "Dollar-cost averaging",
  },
  {
    _id: undefined,
    type: "sell",
    cryptocurrency: "Ethereum",
    symbol: "ETH",
    amount: 2.0,
    price: 2800,
    total: 5600,
    fee: 8.4,
    date: "2024-01-10",
    exchange: "Binance",
    notes: "Profit taking",
  },
  {
    _id: undefined,
    type: "buy",
    cryptocurrency: "Cardano",
    symbol: "ADA",
    amount: 5000,
    price: 0.42,
    total: 2100,
    fee: 2.1,
    date: "2024-01-08",
    exchange: "Kraken",
  },
  {
    _id: undefined,
    type: "buy",
    cryptocurrency: "Bitcoin",
    symbol: "BTC",
    amount: 0.25,
    price: 43800,
    total: 10950,
    fee: 10.95,
    date: "2024-01-05",
    exchange: "Coinbase",
    notes: "Additional accumulation",
  },
  {
    _id: undefined,
    type: "sell",
    cryptocurrency: "Solana",
    symbol: "SOL",
    amount: 25,
    price: 105,
    total: 2625,
    fee: 3.94,
    date: "2024-01-03",
    exchange: "FTX",
  },
];

/* -------------------------------------------------------------------------- */
/*                                 CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

/**
 * Cryptocurrencies and exchanges lists used by the form selects.
 * You can expand these arrays to include more options.
 */
const cryptos = [
  { name: "Bitcoin", symbol: "BTC" },
  { name: "Ethereum", symbol: "ETH" },
  { name: "Cardano", symbol: "ADA" },
  { name: "Solana", symbol: "SOL" },
  { name: "Polygon", symbol: "MATIC" },
  { name: "Chainlink", symbol: "LINK" },
];

const exchanges = ["Coinbase", "Binance", "Kraken", "FTX", "Gemini", "Other"];

/* -------------------------------------------------------------------------- */
/*                                 UTILITIES                                   */
/* -------------------------------------------------------------------------- */

/**
 * Formatting utilities for displaying currency and crypto amounts.
 */
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const formatCrypto = (amount: number, symbol: string) => {
  const decimals = symbol === "BTC" ? 8 : symbol === "ETH" ? 6 : 4;
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })} ${symbol}`;
};

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export default function Transactions() {
  // State: list of transactions shown in UI
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Control whether the add-transaction form is visible
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell">("all");
  const [filterCrypto, setFilterCrypto] = useState<string>("all");

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState<any>({
    type: "buy",
    cryptocurrency: "",
    symbol: "",
    amount: "",
    price: "",
    fee: "",
    date: new Date().toISOString().split("T")[0],
    exchange: "",
    notes: "",
  });

  // Toast hook (shadcn hook)
  const { toast } = useToast();

  // Ref to whole page for PDF export
  const pageRef = useRef<HTMLDivElement | null>(null);

  // Local flag for first load (to populate sample data into DB if DB empty)
  const [initializing, setInitializing] = useState(true);

  // Loading indicator for fetch operations
  const [loading, setLoading] = useState(false);

  /**
   * Fetch transactions from backend on mount.
   * If backend returns empty array, optionally populate with sample data (commented option)
   * If backend unreachable, fallback to local sample data and notify the user.
   */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(API_URL, { method: "GET" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Transaction[] = await res.json();

        // Normalize date strings to yyyy-mm-dd for display
        const normalized = data.map((d) => ({
          ...d,
          date: d.date ? d.date.split("T")[0] : new Date().toISOString().split("T")[0],
        }));

        // If backend returns empty list, we still keep sample data in memory
        if (!normalized || normalized.length === 0) {
          // Option (1): show sample data in UI (without saving to backend)
          // setTransactions(initialTransactions);

          // Option (2): populate DB automatically with sample data.
          // We're conservative: don't auto-insert unless explicitly desired.
          setTransactions(initialTransactions);
          toast({
            title: "No transactions in backend",
            description: "Showing sample data. Connect backend to persist changes.",
          });
        } else {
          setTransactions(normalized);
        }
      } catch (err) {
        // Backend unreachable: fallback to sample data and notify
        console.error("Error fetching transactions:", err);
        toast({
          title: "Backend Unreachable",
          description:
            "Couldn't reach backend. Displaying local sample data. Backend must be running to persist changes.",
          variant: "destructive",
        });
        setTransactions(initialTransactions);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                             CREATE (POST) ACTIONS                           */
  /* -------------------------------------------------------------------------- */

  /**
   * Add transaction handler:
   * - Validates the form
   * - Attempts to POST to backend
   * - If backend is unreachable, falls back to local-only addition (not persisted)
   * - Resets form and closes the add form on success
   */
  const addTransaction = async () => {
    // Basic validation
    if (
      !newTransaction.cryptocurrency ||
      !newTransaction.amount ||
      !newTransaction.price
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill cryptocurrency, amount and price.",
        variant: "destructive",
      });
      return;
    }

    // Build transaction object
    const tx: Transaction = {
      type: newTransaction.type,
      cryptocurrency: newTransaction.cryptocurrency,
      symbol: newTransaction.symbol,
      amount: parseFloat(newTransaction.amount),
      price: parseFloat(newTransaction.price),
      total:
        parseFloat(newTransaction.amount) * parseFloat(newTransaction.price),
      fee: parseFloat(newTransaction.fee) || 0,
      date: newTransaction.date,
      exchange: newTransaction.exchange,
      notes: newTransaction.notes,
    };

    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tx, date: new Date(tx.date).toISOString() }),
      });

      if (!res.ok) {
        // Try to read message; but throw to go to catch
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      // Backend returns saved doc (with _id)
      const saved = await res.json();

      // Normalize date
      const savedTx: Transaction = {
        ...(saved as Transaction),
        date: saved.date ? saved.date.split("T")[0] : tx.date,
      };

      // Update UI
      setTransactions((prev) => [savedTx, ...prev]);

      // Reset form
      setNewTransaction({
        type: "buy",
        cryptocurrency: "",
        symbol: "",
        amount: "",
        price: "",
        fee: "",
        date: new Date().toISOString().split("T")[0],
        exchange: "",
        notes: "",
      });

      setShowAddForm(false);

      toast({
        title: "Transaction saved",
        description: `${savedTx.type.toUpperCase()} ${savedTx.cryptocurrency} recorded.`,
      });
    } catch (err) {
      console.error("Save error:", err);
      // Fallback: insert locally (not persisted)
      const localTx = {
        ...tx,
        // create a pseudo id for local items to identify for deletion in UI
        _id: `local-${Date.now()}`,
      } as Transaction;

      setTransactions((prev) => [localTx, ...prev]);
      setShowAddForm(false);

      toast({
        title: "Save failed",
        description:
          "Could not save to backend; the transaction is added locally only.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             DELETE (DELETE) ACTION                           */
  /* -------------------------------------------------------------------------- */

  /**
   * Delete transaction handler:
   * - Remove from UI immediately
   * - If transaction has a backend _id, attempt DELETE
   * - If DELETE fails, inform user (but UI remains updated)
   */
  const deleteTransaction = async (id?: string) => {
    if (!id) {
      toast({
        title: "Delete failed",
        description: "No id provided",
        variant: "destructive",
      });
      return;
    }

    // Remove from UI first for snappy experience
    setTransactions((prev) => prev.filter((t) => t._id !== id));

    // If it's a local-only id (prefixed 'local-'), skip backend call
    if (id.startsWith("local-")) {
      toast({ title: "Removed", description: "Removed local-only transaction." });
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast({ title: "Deleted", description: "Transaction removed from backend." });
    } catch (err) {
      console.error("Delete error:", err);
      toast({
        title: "Delete failed",
        description:
          "Could not remove from backend. The transaction is removed locally though.",
        variant: "destructive",
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                FILTERING                                    */
  /* -------------------------------------------------------------------------- */

  /**
   * Filtered transactions based on selected filters
   */
  const filteredTransactions = transactions.filter((transaction) => {
    const typeMatch = filterType === "all" || transaction.type === filterType;
    const cryptoMatch = filterCrypto === "all" || transaction.symbol === filterCrypto;
    return typeMatch && cryptoMatch;
  });

  /* -------------------------------------------------------------------------- */
  /*                                SUMMARY STATS                                */
  /* -------------------------------------------------------------------------- */

  /**
   * Derived metrics for summary cards (total invested, total sold, fees, realized PnL)
   */
  const totalInvested = transactions
    .filter((t) => t.type === "buy")
    .reduce((sum, t) => sum + t.total + t.fee, 0);

  const totalSold = transactions
    .filter((t) => t.type === "sell")
    .reduce((sum, t) => sum + t.total - t.fee, 0);

  const totalFees = transactions.reduce((sum, t) => sum + t.fee, 0);

  const realizedPnL = totalSold - totalInvested;

  /* -------------------------------------------------------------------------- */
  /*                           MONTHLY AGGREGATION FOR CHART                      */
  /* -------------------------------------------------------------------------- */

  /**
   * Convert date string "YYYY-MM-DD" into "YYYY-MM" month key
   */
  const monthKey = (isoDate: string) => {
    if (!isoDate) return "unknown";
    const d = new Date(isoDate);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${y}-${m}`;
  };

  /**
   * Aggregate transactions into monthly buckets for chart
   */
  const monthlyAgg = transactions.reduce((acc: Record<string, any>, tx) => {
    const key = monthKey(tx.date);
    if (!acc[key]) acc[key] = { month: key, buyTotal: 0, sellTotal: 0, buyCount: 0, sellCount: 0 };
    if (tx.type === "buy") {
      acc[key].buyTotal += tx.total;
      acc[key].buyCount += 1;
    } else {
      acc[key].sellTotal += tx.total;
      acc[key].sellCount += 1;
    }
    return acc;
  }, {});

  // Convert to array sorted by month ascending
  const monthlyData = Object.values(monthlyAgg).sort((a: any, b: any) =>
    a.month > b.month ? 1 : -1
  );

  // Last month metrics for breakdown card (fallback to zeros if none)
  const lastMonth = monthlyData.length ? monthlyData[monthlyData.length - 1] : null;
  const monthlyBuyCount = lastMonth ? lastMonth.buyCount : 0;
  const monthlySellCount = lastMonth ? lastMonth.sellCount : 0;
  const monthlyBuyTotal = lastMonth ? lastMonth.buyTotal : 0;
  const monthlySellTotal = lastMonth ? lastMonth.sellTotal : 0;
  const avgBuyPrice = monthlyBuyCount ? monthlyBuyTotal / monthlyBuyCount : 0;
  const avgSellPrice = monthlySellCount ? monthlySellTotal / monthlySellCount : 0;

  /* -------------------------------------------------------------------------- */
  /*                                EXPORT PDF                                    */
  /* -------------------------------------------------------------------------- */

  /**
   * Export the contents of pageRef to a multipage PDF using html2canvas + jsPDF
   * - Uses scale: 2 for better resolution
   * - Splits pages if content taller than A4
   */
  const exportToPDF = async () => {
    if (!pageRef.current) {
      toast({
        title: "Export Failed",
        description: "No page content found",
        variant: "destructive",
      });
      return;
    }

    try {
      // capture with higher scale for clarity
      const canvas = await html2canvas(pageRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = (pdf as any).getImageProperties(imgData);
      const imgWidth = pageWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`transactions-${new Date().toISOString().split("T")[0]}.pdf`);
      toast({ title: "Exported", description: "Page saved as PDF" });
    } catch (err) {
      console.error("Export to PDF failed:", err);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting to PDF.",
        variant: "destructive",
      });
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                                  RENDER                                     */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-gradient-hero" ref={pageRef}>
      <Navbar isAuthenticated userRole="user" />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="crypto-gradient-text">Transaction</span> History
            </h1>
            <p className="text-muted-foreground">
              Track your buy/sell transactions and calculate profits
            </p>
          </div>

          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={exportToPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="crypto-glow" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowDownRight className="h-5 w-5 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalInvested)}</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <ArrowUpRight className="h-5 w-5 text-secondary" />
                <span className="text-sm font-medium text-muted-foreground">Total Sold</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalSold)}</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Total Fees</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalFees)}</p>
            </CardContent>
          </Card>

          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                {realizedPnL >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-secondary" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm font-medium text-muted-foreground">Realized P&L</span>
              </div>
              <p className={`text-2xl font-bold ${realizedPnL >= 0 ? "profit" : "loss"}`}>
                {realizedPnL >= 0 ? "+" : ""}
                {formatCurrency(realizedPnL)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full lg:w-auto grid-cols-2 lg:grid-cols-2">
            <TabsTrigger value="transactions">Transaction List</TabsTrigger>
            <TabsTrigger value="analytics">Transaction Analytics</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            {/* Filters */}
            <Card className="crypto-card">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Label>Filter by:</Label>
                  </div>

                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="buy">Buy Only</SelectItem>
                      <SelectItem value="sell">Sell Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterCrypto} onValueChange={(v: any) => setFilterCrypto(v)}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cryptos</SelectItem>
                      {cryptos.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Add Transaction Form - appears only when showAddForm true */}
            {showAddForm && (
              <Card className="crypto-card border-primary/20">
                <CardHeader>
                  <CardTitle>Add New Transaction</CardTitle>
                  <CardDescription>Record a buy or sell transaction</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Transaction Type</Label>
                      <Select
                        value={newTransaction.type}
                        onValueChange={(value: any) =>
                          setNewTransaction((prev: any) => ({ ...prev, type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Cryptocurrency</Label>
                      <Select
                        value={newTransaction.cryptocurrency}
                        onValueChange={(value: any) => {
                          const crypto = cryptos.find((c) => c.name === value);
                          setNewTransaction((prev: any) => ({
                            ...prev,
                            cryptocurrency: value,
                            symbol: crypto?.symbol || "",
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cryptocurrency" />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptos.map((crypto) => (
                            <SelectItem key={crypto.symbol} value={crypto.name}>
                              {crypto.name} ({crypto.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newTransaction.amount}
                        onChange={(e) =>
                          setNewTransaction((prev: any) => ({ ...prev, amount: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Price per unit</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newTransaction.price}
                        onChange={(e) =>
                          setNewTransaction((prev: any) => ({ ...prev, price: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Fee (optional)</Label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        value={newTransaction.fee}
                        onChange={(e) =>
                          setNewTransaction((prev: any) => ({ ...prev, fee: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) =>
                          setNewTransaction((prev: any) => ({ ...prev, date: e.target.value }))
                        }
                      />
                    </div>

                    <div>
                      <Label>Exchange (optional)</Label>
                      <Select
                        value={newTransaction.exchange}
                        onValueChange={(value: any) =>
                          setNewTransaction((prev: any) => ({ ...prev, exchange: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exchange" />
                        </SelectTrigger>
                        <SelectContent>
                          {exchanges.map((exchange) => (
                            <SelectItem key={exchange} value={exchange}>
                              {exchange}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Notes (optional)</Label>
                      <Input
                        placeholder="Add notes..."
                        value={newTransaction.notes}
                        onChange={(e) =>
                          setNewTransaction((prev: any) => ({ ...prev, notes: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button onClick={addTransaction} className="crypto-glow" disabled={loading}>
                      Add Transaction
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddForm(false)} disabled={loading}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transactions Table */}
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Table header */}
                    <div className="grid grid-cols-8 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground">
                      <div>Date</div>
                      <div>Type</div>
                      <div>Crypto</div>
                      <div className="text-right">Amount</div>
                      <div className="text-right">Price</div>
                      <div className="text-right">Total</div>
                      <div className="text-right">Fee</div>
                      <div className="text-right">Action</div>
                    </div>

                    {/* Table rows */}
                    <div className="space-y-3 pt-4">
                      {filteredTransactions.map((transaction) => (
                        <div
                          key={transaction._id ?? `${transaction.cryptocurrency}-${transaction.date}-${transaction.total}`}
                          className="grid grid-cols-8 gap-4 py-3 border-b border-border/50 hover:bg-muted/20 rounded-lg px-2 -mx-2"
                        >
                          <div className="flex items-center">
                            <div>
                              <p className="font-medium">{new Date(transaction.date).toLocaleDateString()}</p>
                              {transaction.exchange && (
                                <p className="text-xs text-muted-foreground">{transaction.exchange}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Badge className={transaction.type === "buy" ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-destructive/20 text-destructive border-destructive/30"}>
                              {transaction.type.toUpperCase()}
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              {transaction.symbol}
                            </Badge>
                            <span className="text-sm">{transaction.cryptocurrency}</span>
                          </div>

                          <div className="text-right">{formatCrypto(transaction.amount, transaction.symbol)}</div>

                          <div className="text-right">{formatCurrency(transaction.price)}</div>

                          <div className="text-right font-medium">{formatCurrency(transaction.total)}</div>

                          <div className="text-right text-sm text-muted-foreground">{formatCurrency(transaction.fee)}</div>

                          <div className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTransaction(transaction._id ?? `local-${transaction.date}-${transaction.total}`)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Monthly Activity</span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="buyTotal" name="Buy Total" fill="#34d399" />
                        <Bar dataKey="sellTotal" name="Sell Total" fill="#f87171" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle>Transaction Breakdown</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Buy Transactions (last month)</span>
                    <span className="font-medium">{monthlyBuyCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sell Transactions (last month)</span>
                    <span className="font-medium">{monthlySellCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Buy Price (last month)</span>
                    <span className="font-medium">{formatCurrency(avgBuyPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Sell Price (last month)</span>
                    <span className="font-medium">{formatCurrency(avgSellPrice || 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
