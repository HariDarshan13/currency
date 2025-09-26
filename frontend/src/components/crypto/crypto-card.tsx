import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCryptoData } from "@/services/cryptoApi";

interface CryptoCardProps {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume?: number;
  className?: string;
}

export function CryptoCard({ 
  name, 
  symbol, 
  price, 
  change24h, 
  marketCap, 
  volume,
  className 
}: CryptoCardProps) {
  const isPositive = change24h >= 0;
  
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

  return (
    <Card className={cn("crypto-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {name}
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {symbol.toUpperCase()}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatPrice(price)}
          </div>
          <div className={cn(
            "flex items-center space-x-1 text-sm font-medium",
            isPositive ? "profit" : "loss"
          )}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span>{isPositive ? '+' : ''}{change24h.toFixed(2)}%</span>
          </div>
        </div>
        
        {(marketCap || volume) && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
            {marketCap && (
              <div>
                <p className="text-xs text-muted-foreground">Market Cap</p>
                <p className="text-sm font-medium">{formatMarketCap(marketCap)}</p>
              </div>
            )}
            {volume && (
              <div>
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="text-sm font-medium">{formatMarketCap(volume)}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}