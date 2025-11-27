import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import {
  Users,
  Camera,
  Video,
  Music,
  FileArchive,
  Star,
  Verified,
  Award,
  RefreshCw,
  Tag,
  DollarSign,
  Eye,
  Heart,
} from "lucide-react";

interface Creator {
  id: string;
  username: string;
  name: string;
  avatar: string;
  cover?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isLive?: boolean;
  freeSubscription: boolean;
  subscriptionPrice?: number;
  subscriberCount: number;
  story?: string;
  mediaStats: {
    images: number;
    videos: number;
    audio: number;
    files: number;
  };
  category?: string;
}

interface CreatorExplorationProps {
  creators: Creator[];
  showRefresh?: boolean;
  showFreeFilter?: boolean;
  title?: string;
  onRefresh?: () => void;
  onToggleFreeFilter?: () => void;
  className?: string;
}

export function CreatorExploration({
  creators,
  showRefresh = false,
  showFreeFilter = false,
  title = "Explore Creators",
  onRefresh,
  onToggleFreeFilter,
  className = "",
}: CreatorExplorationProps) {
  const [freeFilterActive, setFreeFilterActive] = useState(false);

  const handleToggleFreeFilter = () => {
    setFreeFilterActive(!freeFilterActive);
    onToggleFreeFilter?.();
  };

  const CreatorCard = ({ creator }: { creator: Creator }) => (
    <Card className="cyber-border hover:shadow-lg transition-all duration-200 h-full">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div
          className="relative h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-lg overflow-hidden"
          style={{
            backgroundImage: creator.cover
              ? `url(${creator.cover})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Live indicator */}
          {creator.isLive && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Free badge */}
          {creator.freeSubscription && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-600 text-white">FREE</Badge>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative -mt-8 flex justify-center">
          <Link href={`/${creator.username}`}>
            <Avatar className="h-16 w-16 border-4 border-background">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {creator.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        {/* Content */}
        <div className="p-4 pt-2 text-center">
          {/* Name and badges */}
          <div className="mb-2">
            <h3 className="font-semibold truncate flex items-center justify-center space-x-1">
              <span>{creator.name}</span>
              {creator.isVerified && (
                <Verified className="h-4 w-4 text-blue-500 fill-current" />
              )}
              {creator.isFeatured && (
                <Award className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </h3>
            <p className="text-sm text-muted-foreground">@{creator.username}</p>
          </div>

          {/* Media stats */}
          <div className="grid grid-cols-2 gap-4 mb-3 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1">
                <Camera className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  {creator.mediaStats.images.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Photos</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1">
                <Video className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  {creator.mediaStats.videos.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Videos</p>
            </div>
          </div>

          {/* Story */}
          {creator.story && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {creator.story}
            </p>
          )}

          {/* Action buttons */}
          <div className="space-y-2">
            <Link href={`/${creator.username}`} className="block">
              <Button variant="outline" className="w-full" size="sm">
                View Profile
              </Button>
            </Link>

            <Button className="w-full" size="sm">
              {creator.freeSubscription ? (
                <>
                  <Heart className="h-3 w-3 mr-1" />
                  Follow Free
                </>
              ) : (
                <>
                  <DollarSign className="h-3 w-3 mr-1" />$
                  {creator.subscriptionPrice}/month
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreatorListItem = ({ creator }: { creator: Creator }) => (
    <Link href={`/${creator.username}`}>
      <div
        className="block w-100 h-100 rounded-lg overflow-hidden mb-2"
        style={{
          background: creator.cover ? `url(${creator.cover})` : "#505050",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative h-12">
          {creator.freeSubscription && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
              FREE
            </Badge>
          )}
        </div>

        <div className="p-3" style={{ background: "rgba(0,0,0,.35)" }}>
          <div className="flex space-x-3">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={creator.avatar} />
              <AvatarFallback>
                {creator.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <h5 className="font-semibold text-white text-sm">
                  {creator.name}
                </h5>
                {creator.isVerified && (
                  <Verified className="h-3 w-3 text-white fill-current" />
                )}
                {creator.isFeatured && (
                  <Award className="h-3 w-3 text-yellow-400 fill-current" />
                )}
              </div>
              <p className="text-white text-xs opacity-80">
                @{creator.username}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-muted-foreground">
            {title}
          </h3>

          <div className="flex space-x-2">
            {showFreeFilter && creators.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFreeFilter}
                className={`h-8 w-8 p-0 ${freeFilterActive ? "bg-primary/10 text-primary" : ""}`}
                title="Show only free creators"
              >
                <Tag className="h-4 w-4" />
              </Button>
            )}

            {showRefresh && creators.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
                title="Refresh creators"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid View (default) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {creators.slice(0, 6).map((creator) => (
          <CreatorCard key={creator.id} creator={creator} />
        ))}
      </div>

      {/* List View for explore sidebar */}
      <div className="space-y-2">
        {creators.slice(0, 4).map((creator) => (
          <CreatorListItem key={creator.id} creator={creator} />
        ))}
      </div>

      {/* View All Link */}
      {creators.length > 6 && (
        <div className="text-center mt-4">
          <Link href="/creators">
            <Button variant="outline" size="sm">
              View All Creators
            </Button>
          </Link>
        </div>
      )}

      {/* Empty State */}
      {creators.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No creators found</p>
        </div>
      )}
    </div>
  );
}

export default CreatorExploration;
