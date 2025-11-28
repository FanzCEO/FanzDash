import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import {
  Heart,
  Users,
  Star,
  Verified,
  Camera,
  MessageCircle,
  DollarSign,
} from "lucide-react";

interface CreatorCardProps {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  cover?: string;
  isVerified: boolean;
  subscriberCount: number;
  postCount: number;
  subscriptionPrice?: number;
  isOnline?: boolean;
  isLive?: boolean;
  category?: string;
  rating?: number;
  className?: string;
}

export function CreatorCard({
  id,
  username,
  name,
  avatar,
  cover,
  isVerified,
  subscriberCount,
  postCount,
  subscriptionPrice,
  isOnline = false,
  isLive = false,
  category,
  rating,
  className = "",
}: CreatorCardProps) {
  return (
    <Card
      className={`cyber-border hover:shadow-lg transition-all duration-200 ${className}`}
    >
      <CardContent className="p-0">
        {/* Cover Image */}
        <div className="relative h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-lg overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={`${name}'s cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/400/128";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-blue-500" />
          )}

          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1" />
                LIVE
              </Badge>
            </div>
          )}

          {/* Category */}
          {category && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div className="p-4">
          {/* Avatar and basic info */}
          <div className="flex items-start space-x-3 mb-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src={avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Online indicator */}
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold truncate">{name}</h3>
                {isVerified && (
                  <Verified className="h-4 w-4 text-blue-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{username}</p>

              {/* Rating */}
              {rating && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-muted-foreground">
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-3 text-center">
            <div>
              <div className="flex items-center justify-center space-x-1">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  {subscriberCount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Subscribers</p>
            </div>
            <div>
              <div className="flex items-center justify-center space-x-1">
                <Camera className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  {postCount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </div>

          {/* Subscription price */}
          {subscriptionPrice && (
            <div className="text-center mb-3">
              <div className="flex items-center justify-center space-x-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-lg font-bold text-green-600">
                  ${subscriptionPrice}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Link href={`/${username}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                View Profile
              </Button>
            </Link>
            <Button size="sm" className="flex-1">
              <Heart className="h-3 w-3 mr-1" />
              Subscribe
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CreatorCard;
