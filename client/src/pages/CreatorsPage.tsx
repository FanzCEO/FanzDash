import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  Heart,
  Star,
  Verified,
  Radio,
  ChevronDown,
  SlidersHorizontal,
  UserPlus,
  Crown,
} from "lucide-react";

interface Creator {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  coverImage?: string;
  isVerified: boolean;
  isLive: boolean;
  subscribersCount: number;
  postsCount: number;
  subscriptionPrice: number;
  location?: string;
  bio?: string;
  tags: string[];
  joinedAt: string;
  lastActiveAt: string;
  isFeatured: boolean;
  isSubscribed: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  creatorsCount: number;
}

interface CreatorsPageProps {
  creators: Creator[];
  categories: Category[];
  totalCreators: number;
  currentFilters: {
    query?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    category?: string;
    sortBy?: "latest" | "popular" | "featured" | "price_low" | "price_high";
  };
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  onLoadMore: () => void;
  hasMorePages: boolean;
  isLoading: boolean;
  settings: {
    registrationActive: boolean;
    currencySymbol: string;
    disableCreatorsSection: boolean;
  };
  user?: {
    id: string;
    isGuest: boolean;
  };
  className?: string;
}

export function CreatorsPage({
  creators,
  categories,
  totalCreators,
  currentFilters,
  onSearch,
  onFilter,
  onLoadMore,
  hasMorePages,
  isLoading,
  settings,
  user,
  className = "",
}: CreatorsPageProps) {
  const [searchQuery, setSearchQuery] = useState(currentFilters.query || "");
  const [selectedCategory, setSelectedCategory] = useState(
    currentFilters.category || "",
  );
  const [sortBy, setSortBy] = useState(currentFilters.sortBy || "latest");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    onFilter(newFilters);
  };

  const CreatorCard = ({ creator }: { creator: Creator }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-background to-muted/10">
      <div className="relative">
        {/* Cover Image */}
        <div
          className="w-full h-40 bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden"
          style={{
            backgroundImage: creator.coverImage
              ? `url(${creator.coverImage})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

          {/* Live Indicator */}
          {creator.isLive && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="animate-pulse">
                <Radio className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Featured Badge */}
          {creator.isFeatured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-yellow-500 text-black">
                <Crown className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Avatar positioned over cover */}
        <div className="absolute -bottom-12 left-4">
          <Avatar className="h-24 w-24 border-4 border-background ring-2 ring-primary/20">
            <AvatarImage src={creator.avatar} />
            <AvatarFallback className="text-lg bg-primary/10">
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <CardContent className="pt-16 pb-6 px-6">
        {/* Creator Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Link href={`/${creator.username}`}>
              <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                {creator.name}
              </h3>
            </Link>
            {creator.isVerified && (
              <Verified className="h-5 w-5 text-blue-500 fill-current flex-shrink-0" />
            )}
          </div>

          <p className="text-muted-foreground text-sm mb-2">
            @{creator.username}
          </p>

          {creator.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {creator.bio}
            </p>
          )}

          {creator.location && (
            <div className="flex items-center text-xs text-muted-foreground mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              {creator.location}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-lg font-bold">
              {creator.subscribersCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold">{creator.postsCount}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {settings.currencySymbol}
              {creator.subscriptionPrice}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        {/* Tags */}
        {creator.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {creator.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {creator.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{creator.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {user?.isGuest ? (
            <Link href="/signup">
              <Button
                className="w-full"
                data-testid={`view-creator-${creator.id}`}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </Link>
          ) : (
            <div className="flex space-x-2">
              <Link href={`/${creator.username}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full"
                  data-testid={`view-creator-${creator.id}`}
                >
                  View Profile
                </Button>
              </Link>
              <Button
                size="sm"
                variant={creator.isSubscribed ? "secondary" : "default"}
                className="px-3"
                data-testid={`subscribe-creator-${creator.id}`}
              >
                <Heart
                  className={`h-4 w-4 ${creator.isSubscribed ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const CategoryCard = ({ category }: { category: Category }) => (
    <Link href={`/category/${category.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h4 className="font-semibold group-hover:text-primary transition-colors">
                {category.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {category.creatorsCount} creators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-40" />
      <CardContent className="pt-16 pb-6 px-6">
        <div className="absolute -mt-12 left-4">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="w-32 h-6 mb-2" />
        <Skeleton className="w-24 h-4 mb-3" />
        <Skeleton className="w-full h-12 mb-4" />
        <Skeleton className="w-full h-10" />
      </CardContent>
    </Card>
  );

  return (
    <section
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <Users className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            Discover Creators
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The best creators are here.
            {user?.isGuest && settings.registrationActive && (
              <>
                {" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Join now
                </Link>
              </>
            )}
            {!user?.isGuest && (
              <>
                {" "}
                <Link href="/explore" className="text-primary hover:underline">
                  Explore posts
                </Link>
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="mb-6">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search creators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="creators-search-input"
                />
              </form>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Sort Dropdown */}
                <div className="mb-4">
                  <label className="text-sm font-medium mb-2 block">
                    Sort by
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        {sortBy === "latest" && "Latest"}
                        {sortBy === "popular" && "Most Popular"}
                        {sortBy === "featured" && "Featured"}
                        {sortBy === "price_low" && "Price: Low to High"}
                        {sortBy === "price_high" && "Price: High to Low"}
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => setSortBy("latest")}>
                        Latest
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("popular")}>
                        Most Popular
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("featured")}>
                        Featured
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price_low")}>
                        Price: Low to High
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortBy("price_high")}>
                        Price: High to Low
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {searchQuery
                    ? `Search results for "${searchQuery}"`
                    : "All Creators"}
                </h2>
                <p className="text-muted-foreground">
                  {totalCreators.toLocaleString()} creators found
                </p>
              </div>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Creators Grid */}
            {creators.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {creators.map((creator) => (
                    <CreatorCard key={creator.id} creator={creator} />
                  ))}
                </div>

                {/* Load More */}
                {hasMorePages && (
                  <div className="text-center">
                    <Button
                      onClick={onLoadMore}
                      disabled={isLoading}
                      size="lg"
                      variant="outline"
                      className="px-8"
                      data-testid="load-more-creators-btn"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Load More Creators"
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : /* Loading/Empty State */
            isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <LoadingSkeleton key={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/20 rounded-2xl mb-6">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>

                <h3 className="text-2xl font-bold mb-4">No Creators Found</h3>

                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  {searchQuery
                    ? `No creators match your search for "${searchQuery}". Try different keywords.`
                    : "No creators available at the moment. Check back soon!"}
                </p>

                {searchQuery && (
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      onSearch("");
                    }}
                    variant="outline"
                    data-testid="clear-creators-search-btn"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CreatorsPage;
