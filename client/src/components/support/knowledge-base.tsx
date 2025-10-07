import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  BookOpen,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  Clock,
  Tag,
  User,
  TrendingUp,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  Heart,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  tags: string[];
  authorId: string;
  authorName: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  language: string;
  publishedAt: string;
  updatedAt: string;
  readTime: number;
}

interface KnowledgeBaseCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon?: string;
  color: string;
  articleCount: number;
  isPublished: boolean;
  children?: KnowledgeBaseCategory[];
}

interface KnowledgeBaseProps {
  articles: KnowledgeBaseArticle[];
  categories: KnowledgeBaseCategory[];
  featuredArticles: KnowledgeBaseArticle[];
  onSearch: (query: string, filters?: any) => Promise<KnowledgeBaseArticle[]>;
  onRateArticle: (articleId: string, rating: "up" | "down") => Promise<void>;
  onViewArticle: (articleId: string) => Promise<void>;
  currentUser?: {
    id: string;
    name: string;
  };
  className?: string;
}

export function KnowledgeBase({
  articles,
  categories,
  featuredArticles,
  onSearch,
  onRateArticle,
  onViewArticle,
  currentUser,
  className = "",
}: KnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchResults, setSearchResults] = useState<KnowledgeBaseArticle[]>(
    [],
  );
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "helpful">(
    "recent",
  );
  const [activeArticle, setActiveArticle] =
    useState<KnowledgeBaseArticle | null>(null);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await onSearch(query, {
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewArticle = async (article: KnowledgeBaseArticle) => {
    setActiveArticle(article);
    await onViewArticle(article.id);
  };

  const sortArticles = (articlesList: KnowledgeBaseArticle[]) => {
    return [...articlesList].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.viewCount - a.viewCount;
        case "helpful":
          return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
        case "recent":
        default:
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
      }
    });
  };

  const filteredArticles = sortArticles(
    selectedCategory === "all"
      ? articles
      : articles.filter((article) => article.categoryId === selectedCategory),
  );

  const ArticleCard = ({
    article,
    featured = false,
  }: {
    article: KnowledgeBaseArticle;
    featured?: boolean;
  }) => (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 group ${
        featured
          ? "border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50"
          : ""
      }`}
      onClick={() => handleViewArticle(article)}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Badge
                  variant="outline"
                  style={{
                    color: categories.find((c) => c.id === article.categoryId)
                      ?.color,
                  }}
                >
                  {article.categoryName}
                </Badge>
                {article.isFeatured && (
                  <Badge className="bg-yellow-500">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-muted-foreground line-clamp-3">
                {article.summary}
              </p>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {article.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {article.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{article.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{article.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span>{article.upvotes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span>{article.downvotes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{article.readTime} min read</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span>By {article.authorName}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(article.updatedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CategoryCard = ({ category }: { category: KnowledgeBaseCategory }) => (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 ${
        selectedCategory === category.id
          ? "ring-2 ring-primary bg-primary/5"
          : ""
      }`}
      style={{ borderLeftColor: category.color }}
      onClick={() => setSelectedCategory(category.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.icon ? (
              <span className="text-lg">{category.icon}</span>
            ) : (
              <BookOpen className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{category.name}</h3>
            <p className="text-sm text-muted-foreground">
              {category.articleCount} articles
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (activeArticle) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setActiveArticle(null)}
              className="mb-6"
            >
              ← Back to Knowledge Base
            </Button>

            {/* Article */}
            <Card>
              <CardContent className="p-8">
                {/* Header */}
                <div className="border-b pb-6 mb-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <Badge
                      variant="outline"
                      style={{
                        color: categories.find(
                          (c) => c.id === activeArticle.categoryId,
                        )?.color,
                      }}
                    >
                      {activeArticle.categoryName}
                    </Badge>
                    {activeArticle.isFeatured && (
                      <Badge className="bg-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <h1 className="text-4xl font-bold mb-4">
                    {activeArticle.title}
                  </h1>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-4 w-4" />
                        <span>By {activeArticle.authorName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDistanceToNow(
                            new Date(activeArticle.updatedAt),
                            { addSuffix: true },
                          )}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{activeArticle.readTime} min read</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>
                          {activeArticle.viewCount.toLocaleString()} views
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="prose prose-lg max-w-none mb-8"
                  dangerouslySetInnerHTML={{ __html: activeArticle.content }}
                />

                {/* Tags */}
                {activeArticle.tags.length > 0 && (
                  <div className="border-t pt-6 mb-6">
                    <h3 className="font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeArticle.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">
                    Was this article helpful?
                  </h3>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => onRateArticle(activeArticle.id, "up")}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span>Yes ({activeArticle.upvotes})</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onRateArticle(activeArticle.id, "down")}
                      className="flex items-center space-x-2"
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span>No ({activeArticle.downvotes})</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            Knowledge Base
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers, guides, and tutorials to help you get the most out of
            our platform
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-12 h-14 text-lg border-2 border-muted/20 focus:border-primary/50"
              data-testid="kb-search-input"
            />
          </div>
        </div>

        <Tabs value={searchQuery ? "search" : "browse"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="browse"
              className="flex items-center space-x-2"
              onClick={() => setSearchQuery("")}
            >
              <Grid className="h-4 w-4" />
              <span>Browse Articles</span>
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="flex items-center space-x-2"
              disabled={!searchQuery}
            >
              <Search className="h-4 w-4" />
              <span>Search Results</span>
            </TabsTrigger>
          </TabsList>

          {/* Browse Articles Tab */}
          <TabsContent value="browse" className="space-y-8">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Star className="h-6 w-6 mr-2 text-yellow-500" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.slice(0, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} featured />
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Filter className="h-5 w-5" />
                      <span>Categories</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant={selectedCategory === "all" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory("all")}
                    >
                      All Articles ({articles.length})
                    </Button>
                    {categories.map((category) => (
                      <CategoryCard key={category.id} category={category} />
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Articles List */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {selectedCategory === "all"
                      ? "All Articles"
                      : categories.find((c) => c.id === selectedCategory)
                          ?.name || "Articles"}
                    <span className="text-muted-foreground ml-2">
                      ({filteredArticles.length})
                    </span>
                  </h2>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={sortBy === "recent" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("recent")}
                    >
                      Recent
                    </Button>
                    <Button
                      variant={sortBy === "popular" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("popular")}
                    >
                      Popular
                    </Button>
                    <Button
                      variant={sortBy === "helpful" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSortBy("helpful")}
                    >
                      Most Helpful
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {filteredArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {filteredArticles.length === 0 && (
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      No Articles Found
                    </h3>
                    <p className="text-muted-foreground">
                      No articles available in this category yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Search Results Tab */}
          <TabsContent value="search" className="space-y-6">
            {isSearching ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Searching knowledge base...
                </p>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-bold">
                  Search Results for "{searchQuery}" ({searchResults.length})
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  {searchResults.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </>
            ) : searchQuery ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground mb-8">
                  We couldn't find any articles matching "{searchQuery}". Try
                  different keywords or browse by category.
                </p>
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Browse All Articles
                </Button>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default KnowledgeBase;
