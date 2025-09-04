import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import {
  List,
  Filter,
  ArrowLeft,
  Users,
  Star,
  TrendingUp,
  UserPlus,
  Tag,
  Radio,
  Search,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface CategoryFilterProps {
  categories: Category[];
  currentCategory?: string;
  showGenderFilter?: boolean;
  showLiveFilter?: boolean;
  genders?: string[];
  onSearch?: (query: string) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  currentCategory,
  showGenderFilter = false,
  showLiveFilter = false,
  genders = ["male", "female", "couple", "trans"],
  onSearch,
  className = "",
}: CategoryFilterProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilterOpen, setGenderFilterOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("all");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const isCreatorsPage =
    location.includes("/creators") || location.includes("/category");
  const isSearching = searchQuery.length > 2;

  const filterItems = [
    {
      name: "Popular",
      href: currentCategory ? `/category/${currentCategory}` : "/creators",
      icon: "/public/img/popular.png",
      active:
        !location.includes("/featured") &&
        !location.includes("/more-active") &&
        !location.includes("/new") &&
        !location.includes("/free") &&
        !location.includes("/live"),
    },
    {
      name: "Featured Creators",
      href: currentCategory
        ? `/category/${currentCategory}/featured`
        : "/creators/featured",
      icon: "/public/img/featured.png",
      active: location.includes("/featured"),
    },
    {
      name: "More Active",
      href: currentCategory
        ? `/category/${currentCategory}/more-active`
        : "/creators/more-active",
      icon: "/public/img/more-active.png",
      active: location.includes("/more-active"),
    },
    {
      name: "New Creators",
      href: currentCategory
        ? `/category/${currentCategory}/new`
        : "/creators/new",
      icon: "/public/img/creators.png",
      active: location.includes("/new"),
    },
    {
      name: "Free Subscription",
      href: currentCategory
        ? `/category/${currentCategory}/free`
        : "/creators/free",
      icon: "/public/img/unlock.png",
      active: location.includes("/free"),
    },
  ];

  if (showLiveFilter) {
    filterItems.push({
      name: "Live",
      href: "/explore/creators/live",
      icon: "/public/img/live.png",
      active: location.includes("/live"),
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleGenderFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // Build query string
    const params = new URLSearchParams();
    if (selectedGender !== "all") params.set("gender", selectedGender);
    if (minAge) params.set("min_age", minAge);
    if (maxAge) params.set("max_age", maxAge);

    const queryString = params.toString();
    const baseUrl = location.split("?")[0];
    const newUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    window.location.href = newUrl;
    setGenderFilterOpen(false);
  };

  return (
    <div className={className}>
      {/* Categories */}
      <Card className="cyber-border mb-4">
        <CardContent className="p-4">
          {/* Mobile Toggle */}
          <Button
            variant="outline"
            className="w-full mb-4 lg:hidden"
            data-testid="mobile-category-toggle"
          >
            <List className="h-4 w-4 mr-2" />
            Categories
          </Button>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center mb-4">
            <List className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="font-semibold text-muted-foreground">
              Categories
            </span>
          </div>

          {/* Back to All Button */}
          {currentCategory && (
            <div className="mb-4">
              <Link href="/creators">
                <Button variant="outline" size="sm" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <strong>View All</strong>
                </Button>
              </Link>
            </div>
          )}

          {/* Category List */}
          <div className="grid grid-cols-1 gap-2">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start p-3 h-auto ${
                    location.includes(`/category/${category.slug}`)
                      ? "bg-primary/10 text-primary"
                      : ""
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-6 h-6 mr-3 rounded"
                  />
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters - only show if not searching */}
      {!isSearching && (
        <Card className="cyber-border mb-4">
          <CardContent className="p-4">
            {/* Mobile Toggle */}
            <Button
              variant="outline"
              className="w-full mb-4 lg:hidden"
              data-testid="mobile-filter-toggle"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter By
            </Button>

            {/* Desktop Header */}
            <div className="hidden lg:flex items-center mb-4">
              <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="font-semibold text-muted-foreground">
                Filter By
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="grid grid-cols-1 gap-2">
              {filterItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start p-3 h-auto ${
                      item.active ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-6 h-6 mr-3"
                    />
                    {item.name}
                  </Button>
                </Link>
              ))}

              {/* Gender/Age Filter */}
              {showGenderFilter && (
                <Dialog
                  open={genderFilterOpen}
                  onOpenChange={setGenderFilterOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start p-3 h-auto"
                    >
                      <img
                        src="/public/img/genders.png"
                        alt="Gender & Age"
                        className="w-6 h-6 mr-3"
                      />
                      Gender & Age
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Filter by Gender & Age</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleGenderFilter} className="space-y-4">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={selectedGender}
                          onValueChange={setSelectedGender}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            {genders.map((gender) => (
                              <SelectItem key={gender} value={gender}>
                                {gender.charAt(0).toUpperCase() +
                                  gender.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="min-age">Min Age</Label>
                          <Input
                            id="min-age"
                            type="number"
                            min="18"
                            value={minAge}
                            onChange={(e) => setMinAge(e.target.value)}
                            placeholder="18"
                          />
                        </div>
                        <div>
                          <Label htmlFor="max-age">Max Age</Label>
                          <Input
                            id="max-age"
                            type="number"
                            value={maxAge}
                            onChange={(e) => setMaxAge(e.target.value)}
                            placeholder="Any"
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Apply Filters
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="cyber-border">
        <CardContent className="p-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search creators..."
                className="pl-10"
              />
            </div>

            {searchQuery.length > 0 && (
              <Button
                type="submit"
                size="sm"
                className="w-full mt-2"
                disabled={searchQuery.length <= 2}
              >
                Search
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CategoryFilter;
