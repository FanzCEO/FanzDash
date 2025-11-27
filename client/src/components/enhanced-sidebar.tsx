import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Home,
  Video,
  User,
  LayoutDashboard,
  ShoppingBag,
  MessageCircle,
  Compass,
  UserCheck,
  Bookmark,
  Store,
  Verified,
  Film,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  unreadMessages?: number;
}

interface Settings {
  allowReels: boolean;
  disableExploreSection: boolean;
  shop: boolean;
  reelsPublic: boolean;
}

interface EnhancedSidebarProps {
  currentUser?: User;
  settings: Settings;
  isGuest: boolean;
  className?: string;
}

export function EnhancedSidebar({
  currentUser,
  settings,
  isGuest,
  className = "",
}: EnhancedSidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: location === "/",
      show: true,
    },
    // Reels - show if enabled and user has access or is guest with public reels
    {
      name: "Reels",
      href: "/reels",
      icon: Video,
      active: location.startsWith("/reels"),
      show:
        settings.allowReels &&
        ((currentUser && currentUser.isVerified) ||
          (isGuest && settings.reelsPublic)),
      requiresAuth: isGuest && !settings.reelsPublic,
    },
    // User Profile/Page
    {
      name: currentUser?.isVerified ? "My Page" : "My Profile",
      href: currentUser ? `/${currentUser.username}` : "/login",
      icon: User,
      active: currentUser ? location === `/${currentUser.username}` : false,
      show: !!currentUser,
    },
    // Dashboard for verified users
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: location === "/dashboard",
      show: currentUser?.isVerified || false,
    },
    // Purchases
    {
      name: "Purchased",
      href: "/my/purchases",
      icon: ShoppingBag,
      active: location === "/my/purchases",
      show: !!currentUser,
    },
    // Messages
    {
      name: "Messages",
      href: "/messages",
      icon: MessageCircle,
      active: location.startsWith("/messages"),
      show: !!currentUser,
      badge: currentUser?.unreadMessages,
    },
    // Explore (for guests) or authenticated users if not disabled
    {
      name: "Explore",
      href: isGuest ? "/creators" : "/explore",
      icon: Compass,
      active:
        location.startsWith("/explore") || location.startsWith("/creators"),
      show: isGuest || !settings.disableExploreSection,
    },
    // Subscriptions
    {
      name: "Subscriptions",
      href: "/my/subscriptions",
      icon: UserCheck,
      active: location === "/my/subscriptions",
      show: !!currentUser,
    },
    // Bookmarks
    {
      name: "Bookmarks",
      href: "/my/bookmarks",
      icon: Bookmark,
      active: location === "/my/bookmarks",
      show: !!currentUser,
    },
    // Shop for guests
    {
      name: "Shop",
      href: "/shop",
      icon: Store,
      active: location.startsWith("/shop"),
      show: isGuest && settings.shop,
    },
  ].filter((item) => item.show);

  const MenuItem = ({ item }: { item: (typeof menuItems)[0] }) => (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start p-3 h-auto transition-all",
          item.active
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
          collapsed ? "px-2" : "px-3",
        )}
        disabled={item.active}
        data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center space-x-3 w-full">
          <item.icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              item.active ? "text-primary" : "text-muted-foreground",
            )}
          />

          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.name}</span>

              {item.badge && item.badge > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}
            </>
          )}
        </div>
      </Button>
    </Link>
  );

  return (
    <Card
      className={cn("cyber-border sticky-top", className)}
      style={{ top: "1rem" }}
    >
      <CardContent className="p-0">
        {/* Header with user info if logged in */}
        {currentUser && (
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h6 className="font-semibold text-sm truncate">
                      {currentUser.name}
                    </h6>
                    {currentUser.isVerified && (
                      <Verified className="h-4 w-4 text-blue-500 fill-current flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    @{currentUser.username}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="p-2">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem key={item.href} item={item} />
            ))}
          </nav>
        </div>

        {/* Collapse Toggle */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full"
            data-testid="sidebar-collapse-toggle"
          >
            {collapsed ? "→" : "←"}
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EnhancedSidebar;
