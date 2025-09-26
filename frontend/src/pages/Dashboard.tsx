import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/ui/navbar";
import { CryptoCard } from "@/components/crypto/crypto-card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BookmarkPlus, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for demonstration
const mockCryptoData = [
  { name: "Bitcoin", symbol: "BTC", price: 43250.50, change24h: 2.45, marketCap: 847000000000, volume: 25000000000 },
  { name: "Ethereum", symbol: "ETH", price: 2620.30, change24h: -1.23, marketCap: 315000000000, volume: 12000000000 },
  { name: "Cardano", symbol: "ADA", price: 0.485, change24h: 5.67, marketCap: 17000000000, volume: 400000000 },
  { name: "Solana", symbol: "SOL", price: 98.75, change24h: -3.21, marketCap: 42000000000, volume: 1800000000 },
];

const portfolioData = {
  totalValue: 45250.30,
  totalGain: 3450.75,
  totalGainPercent: 8.25,
  topHolding: "Bitcoin",
};

const marketStats = [
  { label: "Total Market Cap", value: "$1.65T", change: "+2.3%" },
  { label: "24h Volume", value: "$89.2B", change: "-5.1%" },
  { label: "Bitcoin Dominance", value: "51.2%", change: "+0.8%" },
  { label: "Active Cryptos", value: "13,456", change: "+12" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="user" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="crypto-gradient-text">Trader</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening in your crypto world today.</p>
        </div>

        {/* Portfolio Summary */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span>Portfolio Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${portfolioData.totalValue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain/Loss</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold profit">
                    +${portfolioData.totalGain.toLocaleString()}
                  </p>
                  <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                    +{portfolioData.totalGainPercent}%
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Holding</p>
                <p className="text-2xl font-bold">{portfolioData.topHolding}</p>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1 crypto-glow" asChild>
                  <Link to="/portfolio">
                    <Wallet className="h-4 w-4 mr-2" />
                    View Portfolio
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {marketStats.map((stat, index) => (
            <Card key={index} className="crypto-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    stat.change.startsWith('+') ? 'profit' : 'loss'
                  }`}>
                    {stat.change.startsWith('+') ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    <span>{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Cryptocurrencies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="crypto-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top Cryptocurrencies</CardTitle>
                  <CardDescription>Real-time market data</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/analytics">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCryptoData.map((crypto, index) => (
                    <CryptoCard
                      key={index}
                      name={crypto.name}
                      symbol={crypto.symbol}
                      price={crypto.price}
                      change24h={crypto.change24h}
                      marketCap={crypto.marketCap}
                      volume={crypto.volume}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your crypto investments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full crypto-glow" asChild>
                  <Link to="/portfolio">
                    <Wallet className="h-4 w-4 mr-2" />
                    Manage Portfolio
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/watchlist">
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Update Watchlist
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/transactions">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>Market Movers</CardTitle>
                <CardDescription>Top gainers and losers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-secondary/20 text-secondary">ADA</Badge>
                      <span className="font-medium">Cardano</span>
                    </div>
                    <div className="flex items-center space-x-2 profit">
                      <TrendingUp className="h-4 w-4" />
                      <span>+5.67%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-secondary/20 text-secondary">SOL</Badge>
                      <span className="font-medium">Solana</span>
                    </div>
                    <div className="flex items-center space-x-2 loss">
                      <TrendingDown className="h-4 w-4" />
                      <span>-3.21%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-secondary/20 text-secondary">BTC</Badge>
                      <span className="font-medium">Bitcoin</span>
                    </div>
                    <div className="flex items-center space-x-2 profit">
                      <TrendingUp className="h-4 w-4" />
                      <span>+2.45%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}