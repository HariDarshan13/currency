import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/ui/navbar";
import { BarChart3, Wallet, BookmarkPlus, TrendingUp, Shield, Zap } from "lucide-react";
import heroImage from "@/assets/crypto-hero.jpg";

const features = [
  {
    icon: Wallet,
    title: "Portfolio Management",
    description: "Track your crypto holdings with real-time profit/loss calculations and performance analytics."
  },
  {
    icon: BookmarkPlus,
    title: "Smart Watchlist",
    description: "Monitor your favorite cryptocurrencies with custom alerts and price notifications."
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Access advanced charts, technical indicators, and market analysis tools."
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Stay updated with the latest crypto news, trends, and market movements."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and privacy measures."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get instant access to real-time price updates and market data."
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Cryptocurrency trading dashboard" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 sm:py-32">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Master Your{" "}
              <span className="crypto-gradient-text">
                Crypto Journey
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              The ultimate platform for tracking, analyzing, and managing your cryptocurrency investments. 
              Real-time data, advanced analytics, and professional-grade tools at your fingertips.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="crypto-glow text-lg px-8 py-6"
                asChild
              >
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-primary/30 hover:border-primary"
                asChild
              >
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="crypto-gradient-text">Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade features designed for both beginners and experienced traders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="crypto-card group hover:scale-105 transition-transform duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary/10 crypto-glow-green group-hover:crypto-glow transition-all duration-300">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="crypto-card border-primary/20">
          <CardContent className="text-center py-16">
            <h3 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Start Trading?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of traders who trust Virtual Currency Tracker for their crypto investments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="crypto-glow text-lg px-8 py-6"
                asChild
              >
                <Link to="/register">Create Account</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6"
                asChild
              >
                <Link to="/dashboard">Explore Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <div className="h-6 w-6 rounded bg-gradient-primary crypto-glow" />
              <span className="font-bold crypto-gradient-text">Virtual Currency Tracker</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Virtual Currency Tracker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}