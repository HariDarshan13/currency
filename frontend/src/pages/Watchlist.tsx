import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/ui/navbar";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Bell, 
  Search,
  TrendingUp, 
  TrendingDown,
  Star,
  AlertCircle
} from "lucide-react";

interface Alert {
  id: number;
  type: 'above' | 'below';
  price: number;
  active: boolean;
}

interface WatchlistItem {
  _id?: string; // MongoDB ID
  id: number;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume: number;
  alerts: Alert[];
}

// Available cryptocurrencies to add
const availableCryptos = [
  { name: "Solana", symbol: "SOL", price: 98.75, change24h: -3.21 },
  { name: "Chainlink", symbol: "LINK", price: 14.56, change24h: 1.89 },
  { name: "Polkadot", symbol: "DOT", price: 7.23, change24h: -0.45 },
  { name: "Avalanche", symbol: "AVAX", price: 36.78, change24h: 4.12 },
  { name: "Cosmos", symbol: "ATOM", price: 12.34, change24h: 2.67 },
];

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlertPrice, setNewAlertPrice] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);
  const { toast } = useToast();

  // Fetch watchlist from backend on load
  useEffect(() => {
    fetch("https://currency-backend-9xq9.onrender.com/api/watchlist")
      .then(res => res.json())
      .then(data => setWatchlist(data))
      .catch(err => console.error("Error fetching watchlist:", err));
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
  };

  // ✅ Add coin to backend + state
  const addToWatchlist = async (crypto: typeof availableCryptos[0]) => {
    const newItem: WatchlistItem = {
      id: Date.now(),
      name: crypto.name,
      symbol: crypto.symbol,
      price: crypto.price,
      change24h: crypto.change24h,
      marketCap: Math.floor(Math.random() * 50000000000),
      volume: Math.floor(Math.random() * 5000000000),
      alerts: []
    };

    try {
      const res = await fetch("https://currency-backend-9xq9.onrender.com/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        const saved = await res.json();
        setWatchlist(prev => [...prev, saved]);
        setShowAddModal(false);
        toast({
          title: "Added to Watchlist",
          description: `${crypto.name} has been added.`,
        });
      }
    } catch (err) {
      console.error("Error adding coin:", err);
    }
  };

  // ✅ Remove from DB + state
  const removeFromWatchlist = async (id: number) => {
    const coin = watchlist.find(item => item.id === id);
    setWatchlist(watchlist.filter(item => item.id !== id));

    if (coin?._id) {
      await fetch(`https://currency-backend-9xq9.onrender.com/api/watchlist/${coin._id}`, {
        method: "DELETE",
      });
    }

    toast({
      title: "Removed from Watchlist",
      description: `${coin?.name} removed.`,
    });
  };

  // ✅ Set alert (save in DB)
  const setAlert = async (coinId: number, price: number, type: 'above' | 'below') => {
    const coin = watchlist.find(item => item.id === coinId);
    if (!coin) return;

    const newAlert: Alert = {
      id: Date.now(),
      type,
      price,
      active: true,
    };

    setWatchlist(prev =>
      prev.map(item =>
        item.id === coinId ? { ...item, alerts: [...item.alerts, newAlert] } : item
      )
    );

    if (coin._id) {
      await fetch(`https://currency-backend-9xq9.onrender.com/api/watchlist/${coin._id}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
    }

    toast({
      title: "Alert Set",
      description: `You'll be notified when ${coin.name} goes ${type} ${formatPrice(price)}.`,
    });

    setNewAlertPrice("");
    setSelectedCoin(null);
  };

  const filteredWatchlist = watchlist.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailable = availableCryptos.filter(crypto =>
    !watchlist.some(item => item.symbol === crypto.symbol) &&
    (crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="user" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="crypto-gradient-text">Watchlist</span> Management
            </h1>
            <p className="text-muted-foreground">Monitor your favorite cryptocurrencies and set price alerts</p>
          </div>
          <Button className="crypto-glow mt-4 sm:mt-0" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Coin
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="crypto-card mb-8">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cryptocurrencies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/50 border-border focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        {/* Watchlist Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {filteredWatchlist.map((item) => (
            <Card key={item.id} className="crypto-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {item.symbol}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="text-sm">{item.symbol.toUpperCase()}</CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromWatchlist(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price Info */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatPrice(item.price)}</div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    item.change24h >= 0 ? 'profit' : 'loss'
                  }`}>
                    {item.change24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%</span>
                  </div>
                </div>

                {/* Market Data */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Market Cap</p>
                    <p className="font-medium">{formatMarketCap(item.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">24h Volume</p>
                    <p className="font-medium">{formatMarketCap(item.volume)}</p>
                  </div>
                </div>

                {/* Alerts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Price Alerts</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCoin(item.id)}
                      className="text-xs"
                    >
                      <Bell className="h-3 w-3 mr-1" />
                      Set Alert
                    </Button>
                  </div>

                  {item.alerts.length > 0 ? (
                    <div className="space-y-1">
                      {item.alerts.slice(0, 2).map((alert) => (
                        <div key={alert.id} className="flex items-center justify-between text-xs bg-muted/30 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-3 w-3 text-accent" />
                            <span>Alert {alert.type} {formatPrice(alert.price)}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {alert.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No alerts set</p>
                  )}
                </div>

                {/* Alert Setting Form */}
                {selectedCoin === item.id && (
                  <div className="space-y-3 border-t border-border pt-3">
                    <Input
                      type="number"
                      placeholder="Alert price"
                      value={newAlertPrice}
                      onChange={(e) => setNewAlertPrice(e.target.value)}
                      className="bg-muted/50 border-border focus:border-primary"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAlert(item.id, parseFloat(newAlertPrice), 'above')}
                        disabled={!newAlertPrice}
                        className="flex-1"
                      >
                        Above
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAlert(item.id, parseFloat(newAlertPrice), 'below')}
                        disabled={!newAlertPrice}
                        className="flex-1"
                      >
                        Below
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Coins Modal */}
        {showAddModal && (
          <Card className="crypto-card">
            <CardHeader>
              <CardTitle>Add to Watchlist</CardTitle>
              <CardDescription>Select cryptocurrencies to add</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAvailable.map((crypto, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                        {crypto.symbol}
                      </Badge>
                      <div>
                        <p className="font-medium">{crypto.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(crypto.price)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToWatchlist(crypto)}
                      className="crypto-glow"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
