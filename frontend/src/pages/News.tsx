"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Navbar } from "@/components/ui/navbar";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Clock,
  Search,
  Filter,
  Bookmark,
  Share2,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewsArticle {
  _id?: string;
  id?: number;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  category: string;
  sentiment: "bullish" | "bearish" | "neutral";
  imageUrl?: string;
  url?: string;
  readTime?: number;
  fullContent?: string; // backend may provide full content
}

const categories = ["All", "Bitcoin", "Ethereum", "DeFi", "Regulation", "NFTs", "CBDC"];
const sentiments = ["All", "Bullish", "Bearish", "Neutral"];

const API =  "https://currency-backend-9xq9.onrender.com/api/news";

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSentiment, setSelectedSentiment] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal
  const [openArticle, setOpenArticle] = useState<NewsArticle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Load articles from backend
  const loadArticles = async () => {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      // Ensure publishedAt normalized
      const normalized: NewsArticle[] = data.map((a: any) => ({
        ...a,
        publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : new Date().toISOString(),
      }));
      // sort newest first
      normalized.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setArticles(normalized);
    } catch (err) {
      console.error("Could not fetch news:", err);
      // keep UI; no toast per your preference
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // Refresh — ask backend to fetch/generate new articles then reload
  const refreshNews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API}/refresh`, { method: "POST" });
      if (!res.ok) throw new Error("Refresh failed");
      await loadArticles();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffInMinutes < 1) return "Just now";
      return `${diffInMinutes}m ago`;
    }
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "bearish":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="h-3 w-3" />;
      case "bearish":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Filtered list
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSentiment =
      selectedSentiment === "All" ||
      article.sentiment.toLowerCase() === selectedSentiment.toLowerCase();
    return matchesSearch && matchesCategory && matchesSentiment;
  });

  // sentiment metrics
  const bullishCount = articles.filter((a) => a.sentiment === "bullish").length;
  const bearishCount = articles.filter((a) => a.sentiment === "bearish").length;
  const neutralCount = articles.filter((a) => a.sentiment === "neutral").length;
  const totalArticles = articles.length;
  const overallSentiment =
    bullishCount > bearishCount ? "Bullish" : bearishCount > bullishCount ? "Bearish" : "Neutral";

  // open modal (fetch full article from backend if necessary)
  const openArticleModal = async (article: NewsArticle) => {
    // try to fetch full content from backend if not present
    if (article.fullContent || article.url) {
      setOpenArticle(article);
      setDialogOpen(true);
      return;
    }
    // fetch full content by id
    if (article._id) {
      try {
        const res = await fetch(`${API}/${article._id}`);
        if (res.ok) {
          const full = await res.json();
          setOpenArticle(full);
          setDialogOpen(true);
          return;
        }
      } catch (err) {
        console.error("Could not fetch full article:", err);
      }
    }
    // fallback: show summary + generated paragraphs
    setOpenArticle(article);
    setDialogOpen(true);
  };

  const closeModal = () => {
    setDialogOpen(false);
    setOpenArticle(null);
  };

  // helper to render 2-3 paragraphs for fallback if no fullContent
  const fallbackParagraphs = (article: NewsArticle) => {
    const p: string[] = [];
    p.push(article.summary);
    p.push(
      `${article.source} reports that the development is having immediate impact in the market. Analysts are watching closely to see how this affects short-term sentiment and liquidity.`
    );
    p.push(
      `Participants expect further updates from primary stakeholders; readers should watch for official announcements and follow reputable sources for verification.`
    );
    return p;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar isAuthenticated userRole="user" />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="crypto-gradient-text">Crypto News</span> & Updates
            </h1>
            <p className="text-muted-foreground">
              Stay informed with the latest cryptocurrency news and market insights
            </p>
          </div>
          <Button
            className="crypto-glow mt-4 sm:mt-0"
            onClick={refreshNews}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh News"}
          </Button>
        </div>

        {/* Market Sentiment Widget */}
        <Card className="crypto-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-primary" />
              <span>Market Sentiment Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Overall Sentiment</p>
                <div className="flex items-center justify-center space-x-2">
                  <p
                    className={`text-2xl font-bold ${
                      overallSentiment === "Bullish"
                        ? "profit"
                        : overallSentiment === "Bearish"
                        ? "loss"
                        : "text-muted-foreground"
                    }`}
                  >
                    {overallSentiment}
                  </p>
                  {overallSentiment === "Bullish" && <TrendingUp className="h-6 w-6 text-secondary" />}
                  {overallSentiment === "Bearish" && (
                    <TrendingDown className="h-6 w-6 text-destructive" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Bullish News</p>
                <p className="text-2xl font-bold profit">{bullishCount}</p>
                <p className="text-xs text-muted-foreground">
                  {totalArticles ? ((bullishCount / totalArticles) * 100).toFixed(1) : "0.0"}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Bearish News</p>
                <p className="text-2xl font-bold loss">{bearishCount}</p>
                <p className="text-xs text-muted-foreground">
                  {totalArticles ? ((bearishCount / totalArticles) * 100).toFixed(1) : "0.0"}%
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Neutral News</p>
                <p className="text-2xl font-bold text-muted-foreground">{neutralCount}</p>
                <p className="text-xs text-muted-foreground">
                  {totalArticles ? ((neutralCount / totalArticles) * 100).toFixed(1) : "0.0"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="crypto-card mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search news articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-border focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sentiments.map((sentiment) => (
                      <SelectItem key={sentiment} value={sentiment}>
                        {sentiment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News Articles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article._id ?? article.title} className="crypto-card group hover:border-primary/30 transition-colors">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {article.category}
                    </Badge>
                    <Badge className={getSentimentColor(article.sentiment)}>
                      {getSentimentIcon(article.sentiment)}
                      <span className="ml-1 capitalize">{article.sentiment}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigator.share ? navigator.share({ title: article.title, url: article.url }) : null}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {article.summary}
                </CardDescription>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">{article.source}</span>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                    <span>{article.readTime ?? 3} min read</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openArticleModal(article)}>
                      Read Full Article
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredArticles.length === 0 && (
          <Card className="crypto-card">
            <CardContent className="text-center py-12">
              <Newspaper className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Articles Found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or filters to find more articles.
              </p>
            </CardContent>
          </Card>
        )}

        {/* removed Load More by request */}
      </div>

      {/* Article Modal (centered) */}
      <Dialog open={dialogOpen} onOpenChange={(val) => { if (!val) closeModal(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex items-start justify-between">
            <div>
              <DialogTitle>{openArticle?.title}</DialogTitle>
              <div className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">{openArticle?.source}</span>
                <span className="mx-2">•</span>
                <span>{formatTimeAgo(openArticle?.publishedAt || new Date().toISOString())}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={closeModal} className="ml-4">
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* if backend provides fullContent use it, otherwise fallback to summary+generated paragraphs */}
            {openArticle && (openArticle.fullContent ? (
              openArticle.fullContent.split("\n\n").map((p, i) => (
                <p key={i} className="text-sm leading-relaxed">{p}</p>
              ))
            ) : (
              fallbackParagraphs(openArticle).map((p, i) => (
                <p key={i} className="text-sm leading-relaxed">{p}</p>
              ))
            ))}

            {/* Optional: direct source link, but we won't navigate automatically */}
            {openArticle?.url && (
              <div className="pt-4">
                <a href={openArticle.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center underline">
                  Read on source
                  <ExternalLink className="h-4 w-4 ml-2" />
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
