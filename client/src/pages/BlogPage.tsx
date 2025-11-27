import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Calendar,
  User,
  ArrowRight,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  publishedAt: string;
  tags: string[];
  readTime: number;
  isPublished: boolean;
}

interface BlogPageProps {
  posts: BlogPost[];
  totalPosts: number;
  currentPage: number;
  onLoadMore: () => void;
  onSearch: (query: string) => void;
  hasMorePages: boolean;
  isLoading: boolean;
  className?: string;
}

export function BlogPage({
  posts,
  totalPosts,
  currentPage,
  onLoadMore,
  onSearch,
  hasMorePages,
  isLoading,
  className = "",
}: BlogPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleLocalSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(query.toLowerCase()),
          ),
      );
      setFilteredPosts(filtered);
    }
  };

  const BlogCard = ({ post }: { post: BlogPost }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-background to-muted/20">
      <div className="relative overflow-hidden">
        {post.image ? (
          <div
            className="w-full h-64 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundImage: `url(${post.image})` }}
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Badge
            variant="secondary"
            className="bg-black/70 text-white border-0"
          >
            {post.readTime} min read
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <img
            src={post.authorAvatar || "/api/placeholder/32/32"}
            alt={post.authorName}
            className="w-8 h-8 rounded-full"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{post.authorName}</p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(post.publishedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>

        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <Link href={`/blog/${post.id}/${post.slug}`}>
          <Button
            variant="ghost"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            data-testid={`read-post-${post.id}`}
          >
            Continue Reading
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <Skeleton className="w-full h-64" />
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="w-24 h-3" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
        <Skeleton className="w-full h-6 mb-3" />
        <Skeleton className="w-full h-4 mb-2" />
        <Skeleton className="w-3/4 h-4 mb-4" />
        <Skeleton className="w-full h-10" />
      </CardContent>
    </Card>
  );

  return (
    <section
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-2xl mb-6">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>

          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            Latest Blog
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stay updated with insights, tutorials, and stories from our
            community
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles, topics, or authors..."
              value={searchQuery}
              onChange={(e) => handleLocalSearch(e.target.value)}
              className="pl-12 pr-4 h-14 text-lg border-2 border-muted/20 focus:border-primary/50 bg-card/50 backdrop-blur-sm"
              data-testid="blog-search-input"
            />
            <Button
              type="submit"
              size="lg"
              className="absolute right-2 top-2 h-10"
              data-testid="blog-search-btn"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-center items-center space-x-8 mb-12 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>{totalPosts} articles</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>{new Set(posts.map((p) => p.authorId)).size} authors</span>
          </div>
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* Load More Section */}
            {hasMorePages && (
              <div className="text-center">
                <Button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  size="lg"
                  variant="outline"
                  className="px-8 py-3 bg-card/50 backdrop-blur-sm border-2 hover:bg-primary hover:text-primary-foreground"
                  data-testid="load-more-posts-btn"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Articles
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        ) : /* Loading State */
        isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-muted/20 rounded-2xl mb-6">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>

            <h3 className="text-2xl font-bold mb-4">No Articles Found</h3>

            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {searchQuery
                ? `No articles match your search for "${searchQuery}". Try different keywords.`
                : "No blog posts have been published yet. Check back soon for fresh content!"}
            </p>

            {searchQuery && (
              <Button
                onClick={() => handleLocalSearch("")}
                variant="outline"
                data-testid="clear-search-btn"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
              <p className="text-muted-foreground mb-6">
                Get the latest articles and insights delivered directly to your
                inbox
              </p>
              <div className="flex space-x-4">
                <Input
                  placeholder="Enter your email"
                  className="flex-1"
                  data-testid="newsletter-email-input"
                />
                <Button className="px-8" data-testid="newsletter-subscribe-btn">
                  Subscribe
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default BlogPage;
