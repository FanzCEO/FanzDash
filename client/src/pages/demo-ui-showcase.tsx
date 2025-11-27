import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommentSystem from "@/components/comment-system";
import PostCreationForm from "@/components/post-creation-form";
import CreatorExploration from "@/components/creator-exploration";
import MediaDisplay from "@/components/media-display";
import MobileNavigation from "@/components/mobile-navigation";
import GifPicker from "@/components/gif-picker";
import Footer from "@/components/footer";
import CategoryFilter from "@/components/category-filter";
import AdvertisingCard from "@/components/ui/advertising-card";
import CreatorCard from "@/components/ui/creator-card";
import LiveComment from "@/components/ui/live-comment";
import UserSettingsNav from "@/components/user-settings-nav";

export default function DemoUIShowcase() {
  const [showGifPicker, setShowGifPicker] = useState(false);

  // Mock data
  const mockCurrentUser = {
    id: "1",
    username: "admin",
    name: "Administrator",
    avatar: "/api/placeholder/80/80",
    isVerified: true,
    darkMode: false,
    postLocked: false,
    freeSubscription: false,
    unreadMessages: 3,
    unreadNotifications: 7,
    hasReelsAccess: true,
    pendingRequests: 2,
  };

  const mockSettings = {
    updateLength: 1000,
    currencySymbol: "$",
    maxFiles: 10,
    allowZipFiles: true,
    allowEpubFiles: true,
    allowReels: true,
    allowScheduled: true,
    allowPPV: true,
    disableFreePost: false,
    liveStreamingStatus: true,
    disableAudio: false,
    disableCreatorsSection: false,
    shop: true,
    title: "FanzDash",
    logo: "logo.png",
    logo2: "logo-dark.png",
    company: "FanzDash Inc.",
    address: "123 Tech Street",
    city: "San Francisco",
    country: "USA",
    showAddressCompanyFooter: true,
    disableContact: false,
    footerBackgroundColor: "#ffffff",
    footerTextColor: "#000000",
    facebook: "https://facebook.com/fanzdash",
    twitter: "https://twitter.com/fanzdash",
    instagram: "https://instagram.com/fanzdash",
  };

  const mockComments = [
    {
      id: "1",
      userId: "2",
      username: "creator1",
      name: "Top Creator",
      avatar: "/api/placeholder/60/60",
      isVerified: true,
      content: "This is an amazing post! Thanks for sharing 🔥",
      likes: 12,
      isLiked: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      replies: [
        {
          id: "1-1",
          userId: "3",
          username: "fan1",
          name: "Biggest Fan",
          avatar: "/api/placeholder/60/60",
          isVerified: false,
          content: "@creator1 I totally agree! This content is incredible",
          likes: 5,
          isLiked: true,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          canEdit: false,
          canDelete: false,
        },
      ],
      canEdit: false,
      canDelete: false,
    },
    {
      id: "2",
      userId: "1",
      username: "admin",
      name: "Administrator",
      avatar: "/api/placeholder/60/60",
      isVerified: true,
      content: "Welcome to the FanzDash platform! 🎉",
      likes: 8,
      isLiked: true,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      replies: [],
      canEdit: true,
      canDelete: true,
    },
  ];

  const mockCreators = [
    {
      id: "1",
      username: "creator1",
      name: "Top Creator",
      avatar: "/api/placeholder/100/100",
      cover: "/api/placeholder/400/200",
      isVerified: true,
      isFeatured: true,
      isLive: true,
      freeSubscription: false,
      subscriptionPrice: 29.99,
      subscriberCount: 15420,
      story:
        "Professional content creator sharing exclusive behind-the-scenes content.",
      mediaStats: { images: 245, videos: 89, audio: 12, files: 5 },
      category: "Lifestyle",
    },
    {
      id: "2",
      username: "artist_jane",
      name: "Jane Artist",
      avatar: "/api/placeholder/100/100",
      cover: "/api/placeholder/400/200",
      isVerified: true,
      isFeatured: false,
      freeSubscription: true,
      subscriberCount: 8750,
      story: "Digital artist creating beautiful illustrations and tutorials.",
      mediaStats: { images: 156, videos: 34, audio: 0, files: 8 },
      category: "Art",
    },
  ];

  const mockMedia = [
    {
      id: "1",
      type: "image" as const,
      file: "/api/placeholder/600/400",
      width: 600,
      height: 400,
    },
    {
      id: "2",
      type: "video" as const,
      file: "/api/placeholder/600/400",
      videoPoster: "/api/placeholder/600/400",
    },
  ];

  const mockPages = [
    {
      id: "1",
      title: "Privacy Policy",
      slug: "privacy",
      access: "all" as const,
    },
    {
      id: "2",
      title: "Terms of Service",
      slug: "terms",
      access: "all" as const,
    },
    {
      id: "3",
      title: "Creator Guidelines",
      slug: "creator-guide",
      access: "creators" as const,
    },
  ];

  const mockCategories = [
    {
      id: "1",
      name: "Lifestyle",
      slug: "lifestyle",
      image: "/api/placeholder/30/30",
    },
    {
      id: "2",
      name: "Fitness",
      slug: "fitness",
      image: "/api/placeholder/30/30",
    },
    { id: "3", name: "Art", slug: "art", image: "/api/placeholder/30/30" },
  ];

  const mockLanguages = [
    { id: "1", name: "English", abbreviation: "en" },
    { id: "2", name: "Spanish", abbreviation: "es" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            FanzDash UI Component Showcase
          </h1>
          <p className="text-muted-foreground">
            Complete implementation of all Sponzy v6.8 Blade templates converted
            to modern React components
          </p>
        </div>

        <Tabs defaultValue="comments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="post-creation">Post Form</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Comment System</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Full-featured commenting with replies, likes, emojis,
                  stickers, and GIFs
                </p>
              </CardHeader>
              <CardContent>
                <CommentSystem
                  postId="demo-post"
                  comments={mockComments}
                  currentUser={mockCurrentUser}
                  onAddComment={(content) =>
                    console.log("Add comment:", content)
                  }
                  onAddReply={(commentId, content, username) =>
                    console.log("Add reply:", { commentId, content, username })
                  }
                  onLikeComment={(commentId, isReply) =>
                    console.log("Like comment:", { commentId, isReply })
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="post-creation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Creation Form</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced post creation with media upload, pricing, scheduling,
                  and rich features
                </p>
              </CardHeader>
              <CardContent>
                <PostCreationForm
                  currentUser={mockCurrentUser}
                  settings={mockSettings}
                  onSubmit={async (data) => console.log("Post data:", data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creator Exploration</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Creator discovery with grid and list views, filtering, and
                  refresh functionality
                </p>
              </CardHeader>
              <CardContent>
                <CreatorExploration
                  creators={mockCreators}
                  showRefresh={true}
                  showFreeFilter={true}
                  onRefresh={() => console.log("Refresh creators")}
                  onToggleFreeFilter={() => console.log("Toggle free filter")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Media Display</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Responsive media grids for images, videos, audio, documents,
                  tips, and gifts
                </p>
              </CardHeader>
              <CardContent>
                <MediaDisplay
                  media={mockMedia}
                  postId="demo-post"
                  description="Demo media content with multiple file types"
                  tip={{ amount: 50, currency: "$" }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Settings Navigation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete settings navigation with conditional sections
                  </p>
                </CardHeader>
                <CardContent>
                  <UserSettingsNav currentUser={mockCurrentUser} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mobile Navigation</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Bottom navigation bar for mobile devices
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative h-32 bg-muted rounded-lg overflow-hidden">
                    <MobileNavigation
                      currentUser={mockCurrentUser}
                      settings={mockSettings}
                      className="relative bottom-0"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Creator Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreatorCard
                    id="demo-creator"
                    username="creator1"
                    name="Top Creator"
                    avatar="/api/placeholder/100/100"
                    cover="/api/placeholder/400/200"
                    isVerified={true}
                    subscriberCount={15420}
                    postCount={334}
                    subscriptionPrice={29.99}
                    isOnline={true}
                    isLive={true}
                    category="Lifestyle"
                    rating={4.8}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Live Comments & Ads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <LiveComment
                    id="live-1"
                    username="viewer123"
                    comment="This stream is amazing! 🔥"
                    timestamp={new Date().toISOString()}
                    tip={{ amount: 25, currency: "$" }}
                  />

                  <AdvertisingCard
                    id="ad-1"
                    title="Premium Creator Tools"
                    description="Unlock advanced analytics and monetization features"
                    image="/api/placeholder/150/100"
                    url="https://example.com/premium"
                    impressions={1250}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="filters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Category & Filter System</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced filtering with categories, search, and gender/age
                  filters
                </p>
              </CardHeader>
              <CardContent>
                <CategoryFilter
                  categories={mockCategories}
                  showGenderFilter={true}
                  showLiveFilter={true}
                  onSearch={(query) => console.log("Search:", query)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Footer Component</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Responsive footer with links, social media, and company
                  information
                </p>
              </CardHeader>
              <CardContent>
                <Footer
                  currentUser={mockCurrentUser}
                  settings={mockSettings}
                  pages={mockPages}
                  categories={mockCategories}
                  languages={mockLanguages}
                  currentLanguage="en"
                  blogsCount={12}
                  categoriesCount={8}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* GIF Picker Demo */}
        <div className="fixed bottom-4 right-4">
          <Button onClick={() => setShowGifPicker(!showGifPicker)}>
            {showGifPicker ? "Hide" : "Show"} GIF Picker
          </Button>

          {showGifPicker && (
            <GifPicker
              isOpen={showGifPicker}
              onClose={() => setShowGifPicker(false)}
              onSelectGif={(url) => {
                console.log("Selected GIF:", url);
                setShowGifPicker(false);
              }}
              className="bottom-16 right-0"
            />
          )}
        </div>

        {/* Success Summary */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="default" className="bg-green-600">
                ✅ Complete
              </Badge>
              <h3 className="text-lg font-semibold text-green-800">
                FanzDash Enterprise Platform - Comprehensive Implementation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-green-700">
              <div>
                <h4 className="font-semibold mb-2">Authentication System</h4>
                <ul className="space-y-1">
                  <li>• Login/Register/Password Reset</li>
                  <li>• Social Login Integration</li>
                  <li>• Two-Factor Authentication</li>
                  <li>• Email Verification</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Content Management</h4>
                <ul className="space-y-1">
                  <li>• Advanced Post Creation</li>
                  <li>• Media Upload & Processing</li>
                  <li>• Comment System</li>
                  <li>• Live Streaming</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Creator Economy</h4>
                <ul className="space-y-1">
                  <li>• Subscription Management</li>
                  <li>• Payment Processing</li>
                  <li>• Withdrawal System</li>
                  <li>• Analytics Dashboard</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Admin Features</h4>
                <ul className="space-y-1">
                  <li>• User Management</li>
                  <li>• Email Templates</li>
                  <li>• Contact Management</li>
                  <li>• System Settings</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">UI Components</h4>
                <ul className="space-y-1">
                  <li>• Responsive Design</li>
                  <li>• Mobile Navigation</li>
                  <li>• Advanced Filtering</li>
                  <li>• Media Galleries</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Enterprise Features</h4>
                <ul className="space-y-1">
                  <li>• Compliance Systems</li>
                  <li>• Audit Logging</li>
                  <li>• Error Handling</li>
                  <li>• Security Controls</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
