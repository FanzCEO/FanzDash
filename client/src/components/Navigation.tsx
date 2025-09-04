import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Globe,
  Brain,
  BarChart3,
  Settings,
  Users,
  FileText,
  AlertTriangle,
  Activity,
  Database,
  Lock,
  Eye,
  Zap,
  BookOpen,
  CreditCard,
  Globe2,
  Clock,
  Store,
  Play,
  LogIn,
  Cloud,
  Calculator,
  Palette,
  Video,
  Sticker,
  Wifi,
  ShoppingCart,
  FileCheck,
  Receipt,
  UserCheck,
  Mail,
  Sparkles,
  Radio,
  Mic,
  Bot,
  Puzzle,
  Webhook,
  CheckCircle2,
  Siren,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Neural Dashboard",
    href: "/",
    icon: Shield,
    description: "Main control center",
  },
  {
    name: "Platform Manager",
    href: "/platforms",
    icon: Globe,
    description: "Manage all FanzDash platforms",
  },
  {
    name: "AI Analysis Engine",
    href: "/ai-analysis",
    icon: Brain,
    description: "ChatGPT-4o content analysis",
  },
  {
    name: "Content Review",
    href: "/content-review",
    icon: Eye,
    description: "Manual approval workflows",
  },
  {
    name: "Live Monitoring",
    href: "/live-monitoring",
    icon: Activity,
    description: "Real-time stream monitoring",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Performance metrics",
  },
  {
    name: "User Management",
    href: "/users",
    icon: Users,
    description: "Admin and moderator accounts",
  },
  {
    name: "Security Vault",
    href: "/vault",
    icon: Lock,
    description: "Encrypted content storage",
  },
  {
    name: "Audit Logs",
    href: "/audit",
    icon: FileText,
    description: "Complete action history",
  },
  {
    name: "Threat Center",
    href: "/threats",
    icon: AlertTriangle,
    description: "Security monitoring",
  },
  {
    name: "Data Management",
    href: "/data",
    icon: Database,
    description: "Database operations",
  },
  {
    name: "Risk Management",
    href: "/risk-management",
    icon: AlertTriangle,
    description: "Threat assessment & mitigation",
  },
  {
    name: "Crisis Management",
    href: "/crisis-management",
    icon: Zap,
    description: "Emergency response center",
  },
  {
    name: "Advanced Analytics",
    href: "/advanced-analytics",
    icon: BarChart3,
    description: "Deep insights & predictions",
  },
  {
    name: "Predictive Analytics",
    href: "/predictive-analytics",
    icon: Brain,
    description: "AI-powered threat forecasting",
  },
  {
    name: "Compliance Reporting",
    href: "/compliance-reporting",
    icon: FileText,
    description: "Regulatory compliance & audit trails",
  },
  {
    name: "Audio Call Settings",
    href: "/audio-calls",
    icon: Settings,
    description: "Agora WebRTC & pricing controls",
  },
  {
    name: "Live Radio Broadcasting",
    href: "/radio-broadcasting",
    icon: Radio,
    description: "Enterprise radio management & moderation",
  },
  {
    name: "Podcast Management",
    href: "/podcast-management",
    icon: Mic,
    description: "Podcast hosting & analytics platform",
  },
  {
    name: "Content Moderation Hub",
    href: "/content-moderation-hub",
    icon: Shield,
    description: "AI-powered content moderation",
  },
  {
    name: "Plugin Management",
    href: "/plugin-management",
    icon: Puzzle,
    description: "FanzOS plugins and integrations",
  },
  {
    name: "API Integration Management",
    href: "/api-integration-management",
    icon: Webhook,
    description: "External API connections",
  },
  {
    name: "Platform-Specific Moderation",
    href: "/platform-moderation",
    icon: Globe2,
    description: "Per-platform moderation settings",
  },
  {
    name: "Compliance Monitoring",
    href: "/compliance-monitoring",
    icon: CheckCircle2,
    description: "2257, GDPR, CCPA compliance",
  },
  {
    name: "Blog Management",
    href: "/blog",
    icon: BookOpen,
    description: "Manage blog posts and articles",
  },
  {
    name: "Deposits Management",
    href: "/deposits",
    icon: CreditCard,
    description: "Review and approve user deposits",
  },
  {
    name: "Location Management",
    href: "/locations",
    icon: Globe2,
    description: "Manage countries, states, and languages",
  },
  {
    name: "Cron Job Management",
    href: "/cron-jobs",
    icon: Clock,
    description: "Automated task scheduling & monitoring",
  },
  {
    name: "Shop Management",
    href: "/shop-management",
    icon: Store,
    description: "Digital/physical products marketplace",
  },
  {
    name: "Stories Management",
    href: "/stories-management",
    icon: Play,
    description: "Ephemeral content & story features",
  },
  {
    name: "Social Login Settings",
    href: "/social-login-settings",
    icon: LogIn,
    description: "OAuth integrations (Facebook, Google, X)",
  },
  {
    name: "Storage Settings",
    href: "/storage-settings",
    icon: Cloud,
    description: "Cloud storage providers & CDN",
  },
  {
    name: "Tax Rate Management",
    href: "/tax-rate-management",
    icon: Calculator,
    description: "Geographic tax configuration",
  },
  {
    name: "Theme Settings",
    href: "/theme-settings",
    icon: Palette,
    description: "Branding, colors, and customization",
  },
  {
    name: "Theme Generator",
    href: "/theme-generator",
    icon: Sparkles,
    description: "Dynamic color palette generator",
  },
  {
    name: "Video Encoding",
    href: "/video-encoding",
    icon: Video,
    description: "FFMPEG/Coconut configuration",
  },
  {
    name: "Stickers Management",
    href: "/stickers-management",
    icon: Sticker,
    description: "Emoji & sticker collections",
  },
  {
    name: "WebSocket Settings",
    href: "/websocket-settings",
    icon: Wifi,
    description: "Pusher & real-time configuration",
  },
  {
    name: "Transaction Management",
    href: "/transaction-management",
    icon: Receipt,
    description: "Financial transactions & payments",
  },
  {
    name: "Verification Management",
    href: "/verification-management",
    icon: UserCheck,
    description: "Document verification workflows",
  },
  {
    name: "Subscription Management",
    href: "/subscription-management",
    icon: CreditCard,
    description: "Creator subscription plans",
  },
  {
    name: "Withdrawal Management",
    href: "/withdrawal-management",
    icon: Receipt,
    description: "Creator withdrawal requests & payouts",
  },
  {
    name: "Email Management",
    href: "/email-management",
    icon: Mail,
    description: "Email templates & notification system",
  },
  {
    name: "User Management",
    href: "/user-management",
    icon: Users,
    description: "User accounts, verification & activity",
  },
  {
    name: "Contact Management",
    href: "/contact-management",
    icon: UserCheck,
    description: "Support messages & customer service",
  },
  {
    name: "SEO Configuration",
    href: "/seo-configuration",
    icon: Globe2,
    description: "Search engine optimization settings",
  },
  {
    name: "System Settings",
    href: "/settings",
    icon: Settings,
    description: "Platform configuration",
  },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="w-64 min-h-screen bg-black/90 border-r border-primary/20 backdrop-blur-xl cyber-border">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center cyber-pulse">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold cyber-text-glow">FanzDash</h1>
            <p className="text-xs text-muted-foreground">
              Enterprise Creator Platform
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-left group transition-all duration-300",
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/30 cyber-border cyber-text-glow"
                      : "hover:bg-primary/10 hover:text-primary hover:border-primary/20",
                  )}
                  data-testid={`nav-${item.href.slice(1) || "dashboard"}`}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 mr-3 transition-all duration-300",
                      isActive ? "cyber-pulse" : "group-hover:cyber-pulse",
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-8 p-4 cyber-card">
          <h3 className="text-sm font-medium mb-3 cyber-text-glow">
            System Status
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>AI Engine</span>
              <span className="text-green-400">OPTIMAL</span>
            </div>
            <div className="flex justify-between">
              <span>Platforms</span>
              <span className="text-green-400">3 ACTIVE</span>
            </div>
            <div className="flex justify-between">
              <span>Security</span>
              <span className="text-yellow-400">MEDIUM</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
