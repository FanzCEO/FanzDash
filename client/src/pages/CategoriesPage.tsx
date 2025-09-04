import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Filter,
  SlidersHorizontal,
  MapPin,
  Star,
  Verified,
  Heart,
  Crown,
} from "lucide-react";

interface Creator {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  subscribersCount: number;
  subscriptionPrice: number;
  location?: string;
  isSubscribed: boolean;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  creatorsCount: number;
}

interface CategoriesPageProps {
  category: Category;
  creators: Creator[];
  allCategories: Category[];
  totalCreators: number;
  currentFilters: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
  };
  onFilter: (filters: any) => void;
  onLoadMore: () => void;
  hasMorePages: boolean;
  isLoading: boolean;
  settings: {
    currencySymbol: string;
    disableCreatorsSection: boolean;
  };
  user?: {
    id: string;
    isGuest: boolean;
  };
  className?: string;
}

export function CategoriesPage({
  category,
  creators,
  allCategories,
  totalCreators,
  currentFilters,
  onFilter,
  onLoadMore,
  hasMorePages,
  isLoading,
  settings,
  user,
  className = "",
}: CategoriesPageProps) {
  const [showFilters, setShowFilters] = useState(false);

  const CreatorCard = ({ creator }: { creator: Creator }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-background to-muted/10">
      <div className="relative p-6">
        {/* Featured Badge */}
        {creator.isFeatured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-yellow-500 text-black">
              <Crown className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Avatar and Info */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="h-16 w-16 ring-2 ring-primary/20">
            <AvatarImage src={creator.avatar} />
            <AvatarFallback className="text-lg bg-primary/10">
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Link href={`/${creator.username}`}>
                <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-1">
                  {creator.name}
                </h3>
              </Link>
              {creator.isVerified && (
                <Verified className="h-4 w-4 text-blue-500 fill-current flex-shrink-0" />
              )}
            </div>

            <p className="text-muted-foreground text-sm mb-2">
              @{creator.username}
            </p>

            {creator.location && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                {creator.location}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div>
            <p className="text-lg font-bold">
              {creator.subscribersCount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="text-lg font-bold">
              {settings.currencySymbol}
              {creator.subscriptionPrice}
            </p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {user?.isGuest ? (
            <Link href="/signup">
              <Button
                className="w-full"
                data-testid={`view-creator-${creator.id}`}
              >
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
      </div>
    </Card>
  );

  const CategoryCard = ({ cat }: { cat: Category }) => (
    <Link href={`/category/${cat.slug}`}>
      <Card
        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
          cat.id === category.id ? "ring-2 ring-primary bg-primary/5" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {cat.image && (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-8 h-8 rounded object-cover"
              />
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold group-hover:text-primary transition-colors ${
                  cat.id === category.id ? "text-primary" : ""
                }`}
              >
                {cat.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {cat.creatorsCount} creators
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const FiltersSidebar = () => (
    <Card>
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

        {/* Add filter controls here based on currentFilters */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Gender</label>
            <select className="w-full p-2 border rounded-md">
              <option value="">All</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Age Range</label>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Min age"
                className="w-full p-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Max age"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <Button className="w-full" size="sm">
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center space-y-1">
            <Skeleton className="w-12 h-6 mx-auto" />
            <Skeleton className="w-16 h-3 mx-auto" />
          </div>
          <div className="text-center space-y-1">
            <Skeleton className="w-12 h-6 mx-auto" />
            <Skeleton className="w-16 h-3 mx-auto" />
          </div>
        </div>
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
          <div className="flex items-center justify-center space-x-3 mb-4">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {category.name}
            </h1>
          </div>

          <p className="text-xl text-muted-foreground">
            {category.description ||
              `Discover amazing creators in ${category.name}`}
          </p>

          <div className="flex items-center justify-center space-x-4 mt-4">
            <Badge variant="secondary" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {totalCreators.toLocaleString()} creators
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            {!settings.disableCreatorsSection && <FiltersSidebar />}

            {/* Categories List */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">All Categories</h3>
                <div className="space-y-2">
                  {allCategories.map((cat) => (
                    <CategoryCard key={cat.id} cat={cat} />
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
                  Creators in {category.name}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                      data-testid="load-more-category-creators-btn"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  No creators found in the {category.name} category. Try
                  browsing other categories.
                </p>

                <Link href="/creators">
                  <Button data-testid="browse-all-creators-btn">
                    Browse All Creators
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CategoriesPage;
