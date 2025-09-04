import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Share2,
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Heart,
  MessageSquare,
  Clock,
  Tag,
  Facebook,
  Twitter,
  Linkedin,
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
  authorBio?: string;
  publishedAt: string;
  tags: string[];
  readTime: number;
  isPublished: boolean;
  seo?: {
    description?: string;
    keywords?: string[];
  };
}

interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image?: string;
  authorName: string;
  publishedAt: string;
  readTime: number;
}

interface BlogPostPageProps {
  post: BlogPost;
  relatedPosts: RelatedPost[];
  onShare: (platform: string, url: string) => void;
  onLike?: (postId: string) => void;
  className?: string;
}

export function BlogPostPage({
  post,
  relatedPosts,
  onShare,
  onLike,
  className = "",
}: BlogPostPageProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(
    Math.floor(Math.random() * 50) + 10,
  );

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    onLike?.(post.id);
  };

  const handleShare = (platform: string) => {
    let shareUrl = "";

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(post.title)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
      onShare(platform, currentUrl);
    }
  };

  const RelatedPostCard = ({ relatedPost }: { relatedPost: RelatedPost }) => (
    <Link href={`/blog/${relatedPost.id}/${relatedPost.slug}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
        <div className="relative">
          {relatedPost.image ? (
            <div
              className="w-full h-32 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundImage: `url(${relatedPost.image})` }}
            />
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h4 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {relatedPost.title}
          </h4>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {relatedPost.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>By {relatedPost.authorName}</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{relatedPost.readTime} min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background to-muted/20 ${className}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <article className="mb-12">
            {/* Hero Image */}
            {post.image && (
              <div className="w-full h-80 lg:h-96 mb-8 rounded-2xl overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Meta */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.authorAvatar} />
                  <AvatarFallback>
                    {post.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{post.authorName}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(post.publishedAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime} min read</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                  {post.excerpt}
                </p>
              )}
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Social Actions */}
            <div className="flex items-center justify-between py-6 border-t border-b">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}
                  data-testid="like-post-btn"
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                  />
                  {likesCount}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground mr-2">
                  Share:
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare("facebook")}
                  className="text-blue-600 hover:text-blue-700"
                  data-testid="share-facebook-btn"
                >
                  <Facebook className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare("twitter")}
                  className="text-blue-400 hover:text-blue-500"
                  data-testid="share-twitter-btn"
                >
                  <Twitter className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare("linkedin")}
                  className="text-blue-700 hover:text-blue-800"
                  data-testid="share-linkedin-btn"
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Author Bio */}
            <Card className="mt-8 bg-muted/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16 flex-shrink-0">
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback className="text-lg">
                      {post.authorName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      About {post.authorName}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {post.authorBio ||
                        `${post.authorName} is a content creator and writer sharing insights and stories.`}
                    </p>
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Related Articles</h2>
                <p className="text-muted-foreground">
                  Continue reading with these related posts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.slice(0, 3).map((relatedPost) => (
                  <RelatedPostCard
                    key={relatedPost.id}
                    relatedPost={relatedPost}
                  />
                ))}
              </div>

              <div className="text-center mt-8">
                <Link href="/blog">
                  <Button variant="outline" size="lg">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View All Articles
                  </Button>
                </Link>
              </div>
            </section>
          )}

          {/* Newsletter CTA */}
          <Card className="mt-16 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Don't Miss Our Latest Content
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Subscribe to our newsletter and get the latest articles
                delivered to your inbox
              </p>
              <div className="flex max-w-md mx-auto space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="newsletter-email-input"
                />
                <Button className="px-6" data-testid="newsletter-subscribe-btn">
                  Subscribe
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BlogPostPage;
