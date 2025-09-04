import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Play,
  Plus,
  Users,
  TrendingUp,
  DollarSign,
  Image as ImageIcon,
  Megaphone,
  X,
  ChevronRight,
  Star,
  Crown,
  Sparkles,
  Heart,
  MessageCircle,
} from "lucide-react";
import PostsFeed from "@/components/posts-feed";
import EnhancedSidebar from "@/components/enhanced-sidebar";

interface Creator {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  subscribersCount: number;
  isSubscribed: boolean;
  subscriptionPrice: number;
}

interface Story {
  id: string;
  userId: string;
  username: string;
  name: string;
  avatar?: string;
  media: Array<{
    id: string;
    type: "photo" | "video";
    url: string;
    thumbnail?: string;
  }>;
  isViewed: boolean;
}

interface HomePageProps {
  user?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
  };
  stories: Story[];
  featuredCreators: Creator[];
  posts: any[];
  onAddStory: () => void;
  onViewStory: (storyId: string) => void;
  settings: {
    homeStyle: number;
    storyStatus: boolean;
    announcement?: string;
    announcementShow?: "all" | "creators";
    announcementType?: "primary" | "success" | "warning" | "danger";
    currencySymbol: string;
    showCounter: boolean;
    earningsSimulator: boolean;
  };
  stats?: {
    totalCreators: number;
    totalContent: number;
    totalEarnings: number;
  };
  isGuest: boolean;
  className?: string;
}

export function HomePage({
  user,
  stories,
  featuredCreators,
  posts,
  onAddStory,
  onViewStory,
  settings,
  stats,
  isGuest,
  className = "",
}: HomePageProps) {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [followers, setFollowers] = useState(1000);
  const [subscriptionPrice, setSubscriptionPrice] = useState(10);

  const showAnnouncementToUser =
    settings.announcement &&
    ((settings.announcementShow === "creators" && user?.isVerified) ||
      settings.announcementShow === "all");

  const estimatedEarnings = Math.round(
    followers * 0.05 * subscriptionPrice * 0.9,
  ); // 5% conversion, 90% after fees

  // Guest Homepage
  if (isGuest) {
    return (
      <div className={`min-h-screen ${className}`}>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-purple-500/10 relative overflow-hidden">
          <div className="container mx-auto px-4 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                      Create.
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Connect.
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-pink-600 to-primary bg-clip-text text-transparent">
                      Earn.
                    </span>
                  </h1>

                  <p className="text-xl text-muted-foreground max-w-lg">
                    Join the ultimate platform for creators to monetize their
                    content and connect with their audience.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Link href="/creators">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-4 text-lg border-2 hover:bg-primary hover:text-primary-foreground"
                    >
                      Explore Creators
                    </Button>
                  </Link>

                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                    >
                      Get Started
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <img
                  src="/api/placeholder/600/400"
                  alt="Platform Preview"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to build, grow, and monetize your creative
                business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Build Your Audience</h3>
                <p className="text-muted-foreground">
                  Connect with fans who truly appreciate your content and are
                  willing to support your creativity.
                </p>
              </Card>

              <Card className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Monetize Your Content
                </h3>
                <p className="text-muted-foreground">
                  Multiple revenue streams including subscriptions, tips,
                  pay-per-view content, and more.
                </p>
              </Card>

              <Card className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Creator-First Platform
                </h3>
                <p className="text-muted-foreground">
                  Built by creators, for creators. We understand your needs and
                  provide tools that work.
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {settings.showCounter && stats && (
          <div className="py-16 bg-gradient-to-r from-primary to-purple-600 text-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2">
                    {stats.totalCreators.toLocaleString()}
                  </div>
                  <p className="text-lg opacity-90">Active Creators</p>
                </div>
                <div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2">
                    {stats.totalContent.toLocaleString()}
                  </div>
                  <p className="text-lg opacity-90">Content Created</p>
                </div>
                <div>
                  <div className="text-4xl lg:text-5xl font-bold mb-2">
                    {settings.currencySymbol}
                    {stats.totalEarnings.toLocaleString()}
                  </div>
                  <p className="text-lg opacity-90">Creator Earnings</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Simulator */}
        {settings.earningsSimulator && (
          <div className="py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4">
                    Earnings Simulator
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    See how much you could earn on our platform
                  </p>
                </div>

                <Card className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <label className="block text-sm font-medium mb-4">
                        Number of Followers
                        <span className="float-right">
                          #{followers.toLocaleString()}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="1000"
                        max="1000000"
                        value={followers}
                        onChange={(e) => setFollowers(parseInt(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-4">
                        Monthly Subscription Price
                        <span className="float-right">
                          {settings.currencySymbol}
                          {subscriptionPrice}
                        </span>
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={subscriptionPrice}
                        onChange={(e) =>
                          setSubscriptionPrice(parseInt(e.target.value))
                        }
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-2">
                      Estimated Monthly Earnings: {settings.currencySymbol}
                      {estimatedEarnings.toLocaleString()}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      * Based on 5% follower conversion rate after platform fees
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="py-20 bg-gradient-to-br from-primary/10 to-purple-500/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are already building their business
              with us
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/creators">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-4 text-lg border-2"
                >
                  Explore Platform
                </Button>
              </Link>
              <Link href="/signup">
                <Button
                  size="lg"
                  className="px-8 py-4 text-lg bg-gradient-to-r from-primary to-purple-600"
                >
                  Start Creating
                  <Sparkles className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated User Homepage
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
          <div className="lg:col-span-6">
            {/* Stories Section */}
            {(stories.length > 0 ||
              (settings.storyStatus && user?.isVerified)) && (
              <Card className="mb-6 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex space-x-4 overflow-x-auto pb-2">
                    {/* Add Story */}
                    {settings.storyStatus && user?.isVerified && (
                      <Button
                        variant="ghost"
                        onClick={onAddStory}
                        className="flex-shrink-0 flex flex-col items-center space-y-2 p-2 hover:bg-primary/10"
                        data-testid="add-story-btn"
                      >
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-2 border-dashed border-primary">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <Plus className="h-3 w-3 text-white" />
                          </div>
                        </div>
                        <span className="text-xs font-medium">Add Story</span>
                      </Button>
                    )}

                    {/* Stories */}
                    {stories.map((story) => (
                      <Button
                        key={story.id}
                        variant="ghost"
                        onClick={() => onViewStory(story.id)}
                        className="flex-shrink-0 flex flex-col items-center space-y-2 p-2"
                        data-testid={`view-story-${story.id}`}
                      >
                        <Avatar
                          className={`h-16 w-16 border-2 ${story.isViewed ? "border-muted" : "border-primary"}`}
                        >
                          <AvatarImage src={story.avatar} />
                          <AvatarFallback>
                            {story.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium max-w-16 truncate">
                          {story.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Announcement */}
            {showAnnouncementToUser && showAnnouncement && (
              <Alert
                className={`mb-6 ${
                  settings.announcementType === "success"
                    ? "border-green-200 bg-green-50"
                    : settings.announcementType === "warning"
                      ? "border-yellow-200 bg-yellow-50"
                      : settings.announcementType === "danger"
                        ? "border-red-200 bg-red-50"
                        : "border-blue-200 bg-blue-50"
                }`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => setShowAnnouncement(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <Megaphone className="h-4 w-4" />
                <AlertDescription>
                  <h4 className="font-semibold mb-2">Announcements</h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: settings.announcement || "",
                    }}
                  />
                </AlertDescription>
              </Alert>
            )}

            {/* Create Post Form (for verified users) */}
            {user?.isVerified && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start text-muted-foreground"
                      data-testid="create-post-btn"
                    >
                      What's on your mind, {user.name}?
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex space-x-4">
                      <Button variant="ghost" size="sm">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Photo
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Video
                      </Button>
                    </div>
                    <Button size="sm">Post</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Feed */}
            <PostsFeed
              posts={posts}
              currentUserId={user?.id}
              onLikePost={() => {}}
              onUnlockPost={() => {}}
              onDeletePost={() => {}}
              onPinPost={() => {}}
              onReportPost={() => {}}
              onCopyLink={() => {}}
              settings={{ currencySymbol: settings.currencySymbol }}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Featured Creators */}
              {featuredCreators.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-4 flex items-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      Featured Creators
                    </h3>
                    <div className="space-y-3">
                      {featuredCreators.slice(0, 5).map((creator) => (
                        <div
                          key={creator.id}
                          className="flex items-center space-x-3"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={creator.avatar} />
                            <AvatarFallback>
                              {creator.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <Link href={`/${creator.username}`}>
                              <p className="font-semibold text-sm hover:text-primary transition-colors">
                                {creator.name}
                              </p>
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {creator.subscribersCount.toLocaleString()}{" "}
                              followers
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant={
                              creator.isSubscribed ? "secondary" : "default"
                            }
                          >
                            {creator.isSubscribed ? (
                              <Heart className="h-3 w-3 fill-current" />
                            ) : (
                              <Heart className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              {user?.isVerified && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-bold mb-4">Your Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Followers
                        </span>
                        <span className="font-semibold">2,431</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Posts
                        </span>
                        <span className="font-semibold">48</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          This Month
                        </span>
                        <span className="font-semibold text-green-600">
                          {settings.currencySymbol}1,247
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
