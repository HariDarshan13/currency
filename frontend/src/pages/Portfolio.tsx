"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, PieChart, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Portfolio() {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHolding, setNewHolding] = useState({ name: "", symbol: "", amount: "", avgPrice: "", currentPrice: "" });

  // Fetch holdings
  useEffect(() => {
    fetch("http://localhost:5000/api/holdings") // ✅ backend running on port 5000
      .then((res) => res.json())
      .then(async (data) => {
        if (data.length === 0) {
          const samples = [
            { name: "Bitcoin", symbol: "BTC", amount: 0.75, avgPrice: 41200, currentPrice: 43250.5 },
            { name: "Ethereum", symbol: "ETH", amount: 5.2, avgPrice: 2750, currentPrice: 2620.3 },
            { name: "Cardano", symbol: "ADA", amount: 10000, avgPrice: 0.42, currentPrice: 0.485 },
          ];
          for (const s of samples) {
            const value = s.currentPrice * s.amount;
            const invested = s.avgPrice * s.amount;
            const gainLoss = value - invested;
            const gainLossPercent = (gainLoss / invested) * 100;
            await fetch("http://localhost:5000/api/holdings", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...s, value, gainLoss, gainLossPercent }),
            });
          }
          const refreshed = await fetch("http://localhost:5000/api/holdings").then((r) => r.json());
          setHoldings(refreshed);
        } else {
          setHoldings(data);
        }
      })
      .catch((err) => console.error("Error fetching holdings:", err));
  }, []);

  // Portfolio summary
  const portfolioSummary = {
    totalValue: holdings.reduce((sum, h) => sum + (h.value || 0), 0),
    totalInvested: holdings.reduce((sum, h) => sum + (h.avgPrice * h.amount), 0),
    totalGainLoss: holdings.reduce((sum, h) => sum + (h.gainLoss || 0), 0),
    totalGainLossPercent: 0,
  };
  portfolioSummary.totalGainLossPercent =
    portfolioSummary.totalInvested > 0 ? (portfolioSummary.totalGainLoss / portfolioSummary.totalInvested) * 100 : 0;

  // Formatters
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  const formatCrypto = (amount: number, decimals: number = 6) =>
    amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals });

  // Add Holding
  const handleAddHolding = async () => {
    const amount = parseFloat(newHolding.amount);
    const avgPrice = parseFloat(newHolding.avgPrice);
    const currentPrice = parseFloat(newHolding.currentPrice);

    const value = currentPrice * amount;
    const invested = avgPrice * amount;
    const gainLoss = value - invested;
    const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;

    const payload = {
      ...newHolding,
      amount,
      avgPrice,
      currentPrice,
      value,
      gainLoss,
      gainLossPercent,
    };

    const res = await fetch("http://localhost:5000/api/holdings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setHoldings([...holdings, data]);
    setShowAddModal(false);
    setNewHolding({ name: "", symbol: "", amount: "", avgPrice: "", currentPrice: "" });
  };

  // Delete Holding
  const handleDeleteHolding = async (id: string) => {
    await fetch(`http://localhost:5000/api/holdings/${id}`, { method: "DELETE" });
    setHoldings(holdings.filter((h) => h._id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="user" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="crypto-gradient-text">Portfolio</span> Management
            </h1>
            <p className="text-muted-foreground">Track and manage your cryptocurrency investments</p>
          </div>
          <Button className="crypto-glow mt-4 sm:mt-0" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Holding
          </Button>
        </div>

        {/* --- Portfolio Summary --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Value */}
          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Total Value</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalValue)}</p>
            </CardContent>
          </Card>
          {/* Total Invested */}
          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <PieChart className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalInvested)}</p>
            </CardContent>
          </Card>
          {/* Total P&L */}
          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                {portfolioSummary.totalGainLoss >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-secondary" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-destructive" />
                )}
                <span className="text-sm font-medium text-muted-foreground">Total P&L</span>
              </div>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${portfolioSummary.totalGainLoss >= 0 ? "profit" : "loss"}`}>
                  {portfolioSummary.totalGainLoss >= 0 ? "+" : ""}
                  {formatCurrency(portfolioSummary.totalGainLoss)}
                </p>
                <Badge
                  className={`${
                    portfolioSummary.totalGainLoss >= 0
                      ? "bg-secondary/20 text-secondary border-secondary/30"
                      : "bg-destructive/20 text-destructive border-destructive/30"
                  }`}
                >
                  {portfolioSummary.totalGainLoss >= 0 ? "+" : ""}
                  {portfolioSummary.totalGainLossPercent.toFixed(2)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          {/* Holdings Count */}
          <Card className="crypto-card">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Holdings</span>
              </div>
              <p className="text-2xl font-bold">{holdings.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* --- Holdings Table --- */}
        <Card className="crypto-card">
          <CardHeader>
            <CardTitle>Your Holdings</CardTitle>
            <CardDescription>Detailed view of your cryptocurrency portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-7 gap-4 pb-4 border-b border-border text-sm font-medium text-muted-foreground">
                  <div>Asset</div>
                  <div className="text-right">Amount</div>
                  <div className="text-right">Avg Price</div>
                  <div className="text-right">Current Price</div>
                  <div className="text-right">Value</div>
                  <div className="text-right">P&L</div>
                  <div className="text-right">Actions</div>
                </div>

                <div className="space-y-4 pt-4">
                  {holdings.map((holding) => (
                    <div
                      key={holding._id}
                      className="grid grid-cols-7 gap-4 py-3 border-b border-border/50 hover:bg-muted/20 rounded-lg px-2 -mx-2"
                    >
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-primary/20 text-primary border-primary/30">{holding.symbol}</Badge>
                        <span className="font-medium">{holding.name}</span>
                      </div>
                      <div className="text-right">
                        {formatCrypto(holding.amount, holding.symbol === "BTC" ? 8 : 6)}
                      </div>
                      <div className="text-right">{formatCurrency(holding.avgPrice)}</div>
                      <div className="text-right">{formatCurrency(holding.currentPrice)}</div>
                      <div className="text-right font-medium">{formatCurrency(holding.value)}</div>
                      <div className="text-right">
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`font-medium ${holding.gainLoss >= 0 ? "profit" : "loss"}`}>
                            {holding.gainLoss >= 0 ? "+" : ""}
                            {formatCurrency(holding.gainLoss)}
                          </span>
                          <Badge
                            className={`text-xs ${
                              holding.gainLoss >= 0
                                ? "bg-secondary/20 text-secondary border-secondary/30"
                                : "bg-destructive/20 text-destructive border-destructive/30"
                            }`}
                          >
                            {holding.gainLoss >= 0 ? "+" : ""}
                            {holding.gainLossPercent.toFixed(2)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteHolding(holding._id)}
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
      </div>

      {/* --- Add Holding Modal --- */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Holding</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={newHolding.name} onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })} />
            <Input placeholder="Symbol" value={newHolding.symbol} onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })} />
            <Input type="number" placeholder="Amount" value={newHolding.amount} onChange={(e) => setNewHolding({ ...newHolding, amount: e.target.value })} />
            <Input type="number" placeholder="Avg Price" value={newHolding.avgPrice} onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })} />
            <Input type="number" placeholder="Current Price" value={newHolding.currentPrice} onChange={(e) => setNewHolding({ ...newHolding, currentPrice: e.target.value })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddHolding}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
