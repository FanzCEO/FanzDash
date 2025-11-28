import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  relevance: number;
  url: string;
}

interface AISearchBarProps {
  onResultClick?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function AISearchBar({
  onResultClick,
  placeholder = "Ask me anything... (AI-powered)",
  className,
}: AISearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "How to set up 2257 compliance?",
    "Configure storage providers",
    "Payment processor setup",
  ]);
  const searchRef = useRef<HTMLDivElement>(null);

  // AI-powered semantic search
  const searchMutation = useMutation({
    mutationFn: (searchQuery: string) =>
      apiRequest<{ results: SearchResult[]; suggestions: string[] }>(
        "/api/wiki/ai-search",
        "POST",
        { query: searchQuery }
      ),
    onSuccess: (data) => {
      setResults(data.results);
      setIsOpen(true);

      // Add to recent searches
      if (query && !recentSearches.includes(query)) {
        setRecentSearches((prev) => [query, ...prev.slice(0, 4)]);
      }
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      searchMutation.mutate(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRecentSearch = (search: string) => {
    setQuery(search);
    searchMutation.mutate(search);
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 90) return "text-green-600 bg-green-100";
    if (relevance >= 70) return "text-blue-600 bg-blue-100";
    if (relevance >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) {
              setIsOpen(true);
            }
          }}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-11 pr-24 h-12 text-base border-2 border-purple-200 focus:border-purple-500 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
            AI
          </Badge>
          <Button
            size="sm"
            className="h-8 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
            onClick={handleSearch}
            disabled={!query.trim() || searchMutation.isPending}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Card className="absolute top-full mt-2 w-full max-h-[500px] overflow-auto shadow-2xl z-50 border-2 border-purple-200">
          <CardContent className="p-4">
            {/* Loading State */}
            {searchMutation.isPending && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-purple-600">
                  <Zap className="h-5 w-5 animate-pulse" />
                  <span>AI is searching...</span>
                </div>
              </div>
            )}

            {/* No Query / Recent Searches */}
            {!query.trim() && !searchMutation.isPending && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <Clock className="h-4 w-4" />
                    <span>Recent Searches</span>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRecentSearch(search)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-sm text-gray-700">{search}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <TrendingUp className="h-4 w-4" />
                    <span>Trending Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "2257 Compliance",
                      "Storage Setup",
                      "Payment Processing",
                      "Content Moderation",
                      "Security Best Practices",
                    ].map((topic, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-purple-50 hover:border-purple-500 transition-colors"
                        onClick={() => {
                          setQuery(topic);
                          searchMutation.mutate(topic);
                        }}
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && !searchMutation.isPending && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Found {results.length} results
                  </span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    AI-Ranked
                  </Badge>
                </div>

                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      if (onResultClick) {
                        onResultClick(result);
                      }
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                        {result.title}
                      </h4>
                      <Badge
                        className={cn("text-xs", getRelevanceColor(result.relevance))}
                      >
                        {result.relevance}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {result.excerpt}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs">
                        {result.category}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {results.length === 0 &&
              query.trim() &&
              !searchMutation.isPending && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No results found for "{query}"
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try different keywords or browse categories
                  </p>
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
