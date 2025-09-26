import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/ui/navbar";
import { Calendar, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";

// Indicators (static)
const indicators = [
  {
    name: "RSI (14)",
    value: "64.2",
    status: "neutral",
    description: "Relative Strength Index",
  },
  {
    name: "MACD",
    value: "+245.8",
    status: "bullish",
    description: "Moving Average Convergence Divergence",
  },
  {
    name: "SMA (20)",
    value: "$42,156",
    status: "bullish",
    description: "Simple Moving Average",
  },
  {
    name: "EMA (50)",
    value: "$41,890",
    status: "bullish",
    description: "Exponential Moving Average",
  },
  {
    name: "Bollinger Bands",
    value: "Upper: $44,200",
    status: "neutral",
    description: "Volatility Indicator",
  },
  {
    name: "Volume",
    value: "125.8K BTC",
    status: "high",
    description: "24h Trading Volume",
  },
];

export default function Analytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M");
  const [selectedChartType, setSelectedChartType] = useState("line");
  const [chartData, setChartData] = useState<any[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  const timeframes = ["1D", "1W", "1M", "1Y", "ALL"];

  // Fetch chart + comparison data from backend
  useEffect(() => {
    fetch(
      `http://localhost:5000/api/analytics?timeframe=${selectedTimeframe}&chartType=${selectedChartType}`
    )
      .then((res) => res.json())
      .then((data) => {
        setChartData(data.chartData || []);
        setComparisonData(data.comparisonData || []);
      })
      .catch((err) => console.error("Error fetching chart data:", err));
  }, [selectedTimeframe, selectedChartType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "bullish":
        return "text-green-500";
      case "bearish":
        return "text-red-500";
      case "high":
        return "text-yellow-500";
      default:
        return "text-gray-500";
    }
  };

  // Render dynamic chart
  const renderChart = () => {
    if (selectedChartType === "line") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="price"
              stroke="hsl(195 100% 50%)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (selectedChartType === "area") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(195 100% 50%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(195 100% 50%)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="price"
              stroke="hsl(195 100% 50%)"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else if (selectedChartType === "bars") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="price" fill="hsl(195 100% 50%)" />
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      // Simplified candlestick using ComposedChart
      return (
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={chartData}>
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="low" fill="#f87171" />
            <Bar dataKey="high" fill="#34d399" />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }
  };

  // Render comparison chart
  const renderComparisonChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={comparisonData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        {comparisonData.length > 0 &&
          Object.keys(comparisonData[0])
            .filter((key) => key !== "time")
            .map((coin, i) => (
              <Line
                key={i}
                type="monotone"
                dataKey={coin}
                stroke={i % 2 === 0 ? "#34d399" : "#f87171"}
                strokeWidth={2}
              />
            ))}
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="user" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            <span className="crypto-gradient-text">Analytics</span> Dashboard
          </h1>
          <p className="text-muted-foreground">
            Advanced charts, technical indicators, and market analysis
          </p>
        </div>

        <Tabs defaultValue="charts" className="space-y-8">
          <TabsList className="grid w-full lg:w-auto grid-cols-3">
            <TabsTrigger value="charts">Price Charts</TabsTrigger>
            <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
            <TabsTrigger value="comparison">Compare Coins</TabsTrigger>
          </TabsList>

          {/* Price Charts */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chart Controls */}
              <Card className="crypto-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>Timeframe</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {timeframes.map((tf) => (
                    <Button
                      key={tf}
                      variant={selectedTimeframe === tf ? "default" : "outline"}
                      className={`w-full ${
                        selectedTimeframe === tf ? "crypto-glow" : ""
                      }`}
                      onClick={() => setSelectedTimeframe(tf)}
                    >
                      {tf}
                    </Button>
                  ))}

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium mb-3">Chart Type</h4>
                    <Select
                      value={selectedChartType}
                      onValueChange={setSelectedChartType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="bars">OHLC Bars</SelectItem>
                        <SelectItem value="candlestick">
                          Candlestick (simplified)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Dynamic Chart */}
              <div className="lg:col-span-3">
                <Card className="crypto-card">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Bitcoin (BTC) Price Chart</CardTitle>
                      <CardDescription>
                        Historical price data - {selectedTimeframe}
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      Live Data
                    </Badge>
                  </CardHeader>
                  <CardContent>{renderChart()}</CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Indicators */}
          <TabsContent value="indicators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {indicators.map((indicator, idx) => (
                <Card key={idx} className="crypto-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">
                        {indicator.name}
                      </CardTitle>
                    </div>
                    <Badge
                      className={`${getStatusColor(indicator.status)} border`}
                    >
                      {indicator.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold crypto-gradient-text">
                        {indicator.value}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {indicator.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compare Coins */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="crypto-card">
              <CardHeader>
                <CardTitle>Compare Cryptocurrencies</CardTitle>
                <CardDescription>
                  Side-by-side analysis of multiple cryptocurrencies
                </CardDescription>
              </CardHeader>
              <CardContent>{renderComparisonChart()}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
