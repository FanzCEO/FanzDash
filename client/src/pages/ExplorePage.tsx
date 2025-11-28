import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  Unlock,
  Globe,
  ChevronDown,
  Sparkles,
  Eye,
} from "lucide-react";
import PostsFeed from "@/components/posts-feed";
import EnhancedSidebar from "@/components/enhanced-sidebar";

interface ExplorePageProps {
  posts: any[];
  featuredCreators: any[];
  currentFilters: {
    query?: string;
    sort?: "latest" | "oldest" | "unlockable" | "free";
  };
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  onLoadMore: () => void;
  hasMorePages: boolean;
  isLoading: boolean;
  user?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  settings: {
    currencySymbol: string;
  };
  className?: string;
}

export function ExplorePage({
  posts,
  featuredCreators,
  currentFilters,
  onSearch,
  onFilter,
  onLoadMore,
  hasMorePages,
  isLoading,
  user,
  settings,
  className = "",
}: ExplorePageProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.query || "");
  const [sortBy, setSortBy] = useState(currentFilters.sort || "latest");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort as any);
    onFilter({ ...currentFilters, sort: newSort });
  };

  return (
    <section className={`min-h-screen bg-background ${className}`}>
      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-2">
            <EnhancedSidebar
              currentUser={user}
              settings={{
                allowReels: true,
                disableExploreSection: false,
                shop: false,
                reelsPublic: true,
              }}
              isGuest={false}
              className="sticky top-6"
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-7">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Explore</h1>
                  <p className="text-muted-foreground">
                    Discover amazing content from creators
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search posts, hashtags, or creators..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 bg-card/50 border-2 border-muted/20 focus:border-primary/50"
                      data-testid="explore-search-input"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-2 top-2 h-8"
                      data-testid="explore-search-btn"
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                  </div>
                </form>

                {/* Sort Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-12 px-4 bg-card/50 border-2 border-muted/20"
                      data-testid="explore-sort-dropdown"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {sortBy === "latest" && "Latest"}
                      {sortBy === "oldest" && "Oldest"}
                      {sortBy === "unlockable" && "Unlockable"}
                      {sortBy === "free" && "Free"}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleSortChange("latest")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Latest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange("oldest")}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Oldest
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleSortChange("unlockable")}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlockable
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("free")}>
                      <Globe className="h-4 w-4 mr-2" />
                      Free
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Active Filters */}
              {(searchQuery || sortBy !== "latest") && (
                <div className="flex items-center space-x-2 mt-4">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Search: "{searchQuery}"
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => {
                          setSearchQuery("");
                          onSearch("");
                        }}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}
                  {sortBy !== "latest" && (
                    <Badge variant="secondary" className="px-3 py-1">
                      Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => handleSortChange("latest")}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Posts Feed */}
            {posts.length > 0 ? (
              <>
                <PostsFeed
                  posts={posts}
                  currentUserId={user?.id}
                  onLikePost={() => {}}
                  onUnlockPost={() => {}}
                  onDeletePost={() => {}}
                  onPinPost={() => {}}
                  onReportPost={() => {}}
                  onCopyLink={() => {}}
                  settings={settings}
                />

                {/* Load More */}
                {hasMorePages && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={onLoadMore}
                      disabled={isLoading}
                      size="lg"
                      variant="outline"
                      className="px-8"
                      data-testid="load-more-posts-btn"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Loading More...
                        </>
                      ) : (
                        <>
                          Load More Posts
                          <TrendingUp className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/20 rounded-3xl mb-6">
                  <Eye className="h-12 w-12 text-muted-foreground" />
                </div>

                <h3 className="text-2xl font-bold mb-4">No Posts Found</h3>

                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? `No posts match your search for "${searchQuery}". Try different keywords or explore creators.`
                    : "No posts have been shared yet. Follow some creators to see their content in your explore feed."}
                </p>

                <div className="flex justify-center space-x-4">
                  {searchQuery ? (
                    <Button
                      onClick={() => {
                        setSearchQuery("");
                        onSearch("");
                      }}
                      variant="outline"
                      data-testid="clear-explore-search-btn"
                    >
                      Clear Search
                    </Button>
                  ) : (
                    <Link href="/creators">
                      <Button data-testid="explore-creators-btn">
                        Explore Creators
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3">
            <div className="sticky top-6 space-y-6">
              {/* Trending Tags */}
              <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Trending Tags
                  </h3>
                  <div className="space-y-2">
                    {[
                      "#photography",
                      "#fitness",
                      "#art",
                      "#music",
                      "#lifestyle",
                    ].map((tag, index) => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left p-2 h-auto"
                        onClick={() => {
                          setSearchQuery(tag);
                          onSearch(tag);
                        }}
                        data-testid={`trending-tag-${index}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{tag}</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.floor(Math.random() * 1000) + 100}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Suggested Creators */}
              {featuredCreators.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-4">Suggested Creators</h3>
                    <div className="space-y-3">
                      {featuredCreators.slice(0, 5).map((creator) => (
                        <div
                          key={creator.id}
                          className="flex items-center space-x-3"
                        >
                          <img
                            src={creator.avatar || "/api/placeholder/40/40"}
                            alt={creator.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <Link href={`/${creator.username}`}>
                              <p className="font-semibold text-sm hover:text-primary transition-colors">
                                {creator.name}
                              </p>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              @{creator.username}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Follow
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Explore Stats */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4">Explore Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Posts today
                      </span>
                      <Badge variant="secondary">247</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Active creators
                      </span>
                      <Badge variant="secondary">1.2k</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Trending now
                      </span>
                      <Badge className="bg-green-500">Live</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/creators">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Browse All Creators
                      </Button>
                    </Link>
                    <Link href="/categories">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Browse Categories
                      </Button>
                    </Link>
                    <Link href="/live">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        Live Streams
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ExplorePage;
