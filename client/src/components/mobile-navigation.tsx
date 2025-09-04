import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Home, Compass, ShoppingBag, Send, Bell, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  currentUser?: {
    id: string;
    unreadMessages: number;
    unreadNotifications: number;
    hasReelsAccess: boolean;
  };
  settings: {
    disableCreatorsSection: boolean;
    allowReels: boolean;
    shop: boolean;
  };
  className?: string;
}

export function MobileNavigation({
  currentUser,
  settings,
  className = "",
}: MobileNavigationProps) {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      active: location === "/",
      always: true,
    },
    {
      name: "Explore",
      href: "/creators",
      icon: Compass,
      active:
        location.startsWith("/creators") || location.startsWith("/explore"),
      show: !settings.disableCreatorsSection,
    },
    {
      name: "Reels",
      href: "/reels",
      icon: Video,
      active: location.startsWith("/reels"),
      show: settings.allowReels && currentUser?.hasReelsAccess,
    },
    {
      name: "Shop",
      href: "/shop",
      icon: ShoppingBag,
      active: location.startsWith("/shop"),
      show: settings.shop,
    },
    {
      name: "Messages",
      href: "/messages",
      icon: Send,
      active: location.startsWith("/messages"),
      badge: currentUser?.unreadMessages,
      always: true,
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      active: location.startsWith("/notifications"),
      badge: currentUser?.unreadNotifications,
      always: true,
    },
  ].filter((item) => item.always || item.show);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg md:hidden",
        className,
      )}
    >
      <div className="flex items-center justify-around p-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <button
              className={cn(
                "relative flex flex-col items-center justify-center p-3 rounded-lg transition-colors min-w-[60px]",
                item.active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              aria-label={item.name}
            >
              {/* Badge for notifications */}
              {item.badge && item.badge > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </Badge>
              )}

              <item.icon
                className={cn("h-6 w-6 mb-1", item.active && "text-primary")}
              />

              <span className="text-xs font-medium">{item.name}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileNavigation;
