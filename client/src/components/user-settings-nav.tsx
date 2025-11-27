import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  User,
  Edit,
  LayoutDashboard,
  MessageSquare,
  Wallet,
  UserPlus,
  Clock,
  Star,
  Video,
  Phone,
  Instagram,
  Users,
  UserCheck,
  CreditCard,
  Receipt,
  Shield,
  Key,
  EyeOff,
  Slash,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useState } from "react";

interface UserSettingsNavProps {
  currentUser?: {
    id: string;
    username: string;
    isVerified: boolean;
    pendingRequests?: number;
  };
  className?: string;
}

export function UserSettingsNav({
  currentUser,
  className = "",
}: UserSettingsNavProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock settings for demonstration
  const settings = {
    disableWallet: false,
    referralSystem: true,
    storyStatus: true,
    videoCallStatus: true,
    audioCallStatus: true,
    allowReels: true,
    liveStreamingPrivate: true,
  };

  const accountItems = [
    ...(currentUser?.isVerified
      ? [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            active: location === "/dashboard",
          },
        ]
      : []),
    {
      name: currentUser?.isVerified ? "My Page" : "My Profile",
      href: `/${currentUser?.username}`,
      icon: User,
      active: location === `/${currentUser?.username}`,
      external: true,
    },
    {
      name: currentUser?.isVerified ? "Edit My Page" : "Edit Profile",
      href: "/settings/page",
      icon: Edit,
      active: location === "/settings/page",
    },
    ...(currentUser?.isVerified
      ? [
          {
            name: "Conversations",
            href: "/settings/conversations",
            icon: MessageSquare,
            active: location === "/settings/conversations",
          },
        ]
      : []),
    ...(!settings.disableWallet
      ? [
          {
            name: "Wallet",
            href: "/my/wallet",
            icon: Wallet,
            active: location === "/my/wallet",
          },
        ]
      : []),
    ...(settings.referralSystem
      ? [
          {
            name: "Referrals",
            href: "/my/referrals",
            icon: UserPlus,
            active: location === "/my/referrals",
          },
        ]
      : []),
    ...(settings.storyStatus && currentUser?.isVerified
      ? [
          {
            name: "My Stories",
            href: "/my/stories",
            icon: Clock,
            active: location === "/my/stories",
          },
        ]
      : []),
    {
      name: currentUser?.isVerified ? "Verified Account" : "Become Creator",
      href: "/settings/verify/account",
      icon: currentUser?.isVerified ? UserCheck : Star,
      active: location === "/settings/verify/account",
    },
    ...(settings.videoCallStatus && currentUser?.isVerified
      ? [
          {
            name: "Video Call Settings",
            href: "/settings/video-call",
            icon: Video,
            active: location === "/settings/video-call",
          },
        ]
      : []),
    ...(settings.audioCallStatus && currentUser?.isVerified
      ? [
          {
            name: "Audio Call Settings",
            href: "/settings/audio-call",
            icon: Phone,
            active: location === "/settings/audio-call",
          },
        ]
      : []),
    ...(settings.allowReels && currentUser?.isVerified
      ? [
          {
            name: "My Reels",
            href: "/my/reels",
            icon: Instagram,
            active: location === "/my/reels",
          },
        ]
      : []),
  ];

  const liveStreamingItems = settings.liveStreamingPrivate
    ? [
        ...(currentUser?.isVerified
          ? [
              {
                name: "Settings",
                href: "/my/live/private/settings",
                icon: LayoutDashboard,
                active: location === "/my/live/private/settings",
              },
              {
                name: "Requests Received",
                href: "/my/live/private/requests",
                icon: UserCheck,
                active: location === "/my/live/private/requests",
                badge: currentUser?.pendingRequests,
              },
            ]
          : []),
        {
          name: "Requests Sent",
          href: "/my/live/private/requests/sended",
          icon: UserPlus,
          active: location === "/my/live/private/requests/sended",
        },
      ]
    : [];

  const subscriptionItems = [
    ...(currentUser?.isVerified
      ? [
          {
            name: "Subscription Price",
            href: "/settings/subscription",
            icon: CreditCard,
            active: location === "/settings/subscription",
          },
          {
            name: "My Subscribers",
            href: "/my/subscribers",
            icon: Users,
            active: location === "/my/subscribers",
          },
        ]
      : []),
    {
      name: "My Subscriptions",
      href: "/my/subscriptions",
      icon: UserCheck,
      active: location === "/my/subscriptions",
    },
  ];

  const privacyItems = [
    {
      name: "Privacy & Security",
      href: "/privacy/security",
      icon: Shield,
      active: location === "/privacy/security",
    },
    {
      name: "Password",
      href: "/settings/password",
      icon: Key,
      active: location === "/settings/password",
    },
    ...(currentUser?.isVerified
      ? [
          {
            name: "Block Countries",
            href: "/block/countries",
            icon: EyeOff,
            active: location === "/block/countries",
          },
        ]
      : []),
    {
      name: "Restricted Users",
      href: "/settings/restrictions",
      icon: Slash,
      active: location === "/settings/restrictions",
    },
  ];

  const paymentItems = [
    {
      name: "Payments",
      href: "/my/payments",
      icon: Receipt,
      active: location === "/my/payments",
    },
    ...(currentUser?.isVerified
      ? [
          {
            name: "Payments Received",
            href: "/my/payments/received",
            icon: Receipt,
            active: location === "/my/payments/received",
          },
        ]
      : []),
  ];

  const renderNavSection = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <Card className="cyber-border mb-3">
        <CardContent className="p-0">
          <div className="px-4 pt-3 pb-1">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-2 h-auto",
                    item.active && "bg-primary/10 text-primary",
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2">
                      {item.badge}
                    </Badge>
                  )}
                  <ChevronRight className="h-3 w-3 ml-2 opacity-50" />
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      {/* Mobile menu toggle */}
      <Button
        variant="outline"
        className="w-full mb-3 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        data-testid="mobile-menu-toggle"
      >
        <Menu className="h-4 w-4 mr-2" />
        Menu
      </Button>

      {/* Navigation content */}
      <div
        className={cn(
          "space-y-0",
          "lg:block",
          isMobileMenuOpen ? "block" : "hidden lg:block",
        )}
      >
        {renderNavSection("Account", accountItems)}
        {renderNavSection("Live Streaming Private", liveStreamingItems)}
        {renderNavSection("Subscription", subscriptionItems)}
        {renderNavSection("Privacy & Security", privacyItems)}
        {renderNavSection("Payments", paymentItems)}
      </div>
    </div>
  );
}

export default UserSettingsNav;
