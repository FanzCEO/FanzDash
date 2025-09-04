import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  ChevronDown,
  ChevronRight,
  Search,
  Film,
  Calculator as CalculatorIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
  requiresCompliance?: boolean;
  complianceLevel?: string;
  requiresSuperAdmin?: boolean;
}

interface NavigationCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  items: NavigationItem[];
}

// Compliance-aware navigation structure based on Fanz Foundation knowledge base
const navigationCategories: NavigationCategory[] = [
  {
    id: "media-content",
    name: "MEDIA/CONTENT",
    icon: Eye,
    description: "Content moderation & review workflows",
    items: [
      {
        name: "Content Moderation Hub",
        href: "/content-moderation-hub",
        icon: Shield,
        description: "AI-powered content moderation with 2257 compliance",
        requiresCompliance: true,
        complianceLevel: "2257_OFFICER"
      },
      {
        name: "Media Review Queue",
        href: "/content-review",
        icon: Eye,
        description: "Manual approval workflows with audit trails",
        requiresCompliance: true,
        complianceLevel: "MODERATOR"
      },
      {
        name: "Live Stream Monitoring",
        href: "/live-monitoring",
        icon: Activity,
        description: "Real-time stream surveillance & moderation",
        requiresCompliance: true,
        complianceLevel: "MODERATOR"
      },
      {
        name: "Co-Star Verification",
        href: "/verification-management",
        icon: UserCheck,
        description: "18 U.S.C. § 2257 co-star verification system",
        requiresCompliance: true,
        complianceLevel: "2257_OFFICER",
        requiresSuperAdmin: true
      }
    ]
  },
  {
    id: "compliance-legal",
    name: "COMPLIANCE/LEGAL",
    icon: CheckCircle2,
    description: "Legal compliance & regulatory monitoring",
    items: [
      {
        name: "Compliance Monitoring",
        href: "/compliance-monitoring",
        icon: CheckCircle2,
        description: "GDPR, CCPA, 2257 compliance tracking",
        requiresCompliance: true,
        complianceLevel: "COMPLIANCE_OFFICER"
      },
      {
        name: "Audit Logs",
        href: "/audit",
        icon: FileText,
        description: "Immutable 7-year audit trail system",
        requiresCompliance: true,
        complianceLevel: "COMPLIANCE_OFFICER"
      },
      {
        name: "Crisis Management",
        href: "/crisis-management",
        icon: Siren,
        description: "Emergency response & CSAM escalation",
        requiresCompliance: true,
        complianceLevel: "CRISIS_MANAGER",
        requiresSuperAdmin: true
      },
      {
        name: "Legal Hold Management",
        href: "/legal-holds",
        icon: Lock,
        description: "Data preservation during investigations",
        requiresCompliance: true,
        complianceLevel: "LEGAL_TEAM",
        requiresSuperAdmin: true
      }
    ]
  },
  {
    id: "database-storage",
    name: "DATABASE/STORAGE", 
    icon: Database,
    description: "Data management & retention policies",
    items: [
      {
        name: "Data Management",
        href: "/data",
        icon: Database,
        description: "Database operations with retention policies"
      },
      {
        name: "Storage Settings",
        href: "/storage-settings",
        icon: Cloud,
        description: "Cloud storage & secure deletion protocols"
      },
      {
        name: "Security Vault",
        href: "/vault",
        icon: Lock,
        description: "Encrypted forensic content storage",
        requiresCompliance: true,
        complianceLevel: "SECURITY_OFFICER"
      }
    ]
  },
  {
    id: "platform-connections",
    name: "PLATFORM/CONNECTIONS",
    icon: Globe2,
    description: "Multi-platform & API management",
    items: [
      {
        name: "Platform Manager",
        href: "/platforms",
        icon: Globe,
        description: "Fanz ecosystem platform management"
      },
      {
        name: "API Integration Management",
        href: "/api-integration-management", 
        icon: Webhook,
        description: "External API connections & monitoring"
      },
      {
        name: "Plugin Management",
        href: "/plugin-management",
        icon: Puzzle,
        description: "FanzOS plugins and integrations"
      }
    ]
  },
  {
    id: "ai-intelligence",
    name: "AI/INTELLIGENCE",
    icon: Brain,
    description: "AI analysis & threat detection",
    items: [
      {
        name: "AI Analysis Engine",
        href: "/ai-analysis",
        icon: Brain,
        description: "ChatGPT-4o/GPT-5 content analysis"
      },
      {
        name: "Threat Center",
        href: "/threats",
        icon: AlertTriangle,
        description: "AI-powered threat detection & CSAM scanning",
        requiresCompliance: true,
        complianceLevel: "SECURITY_OFFICER"
      },
      {
        name: "Risk Management",
        href: "/risk-management",
        icon: AlertTriangle,
        description: "Predictive threat assessment"
      },
      {
        name: "AI CFO & Financial Copilot",
        href: "/ai-cfo",
        icon: CalculatorIcon,
        description: "AI-powered financial analysis and automated ecosystem maintenance"
      },
      {
        name: "Starz Studio Admin Panel",
        href: "/starz-studio",
        icon: Film,
        description: "AI-powered content production service for multi-platform publishing"
      }
    ]
  },
  {
    id: "user-financial",
    name: "USER/FINANCIAL",
    icon: Users,
    description: "User accounts & financial operations", 
    items: [
      {
        name: "User Management",
        href: "/users",
        icon: Users,
        description: "Creator & subscriber account management"
      },
      {
        name: "Transaction Management",
        href: "/transaction-management",
        icon: Receipt,
        description: "Payment processing & financial audits"
      },
      {
        name: "Withdrawal Management",
        href: "/withdrawal-management",
        icon: Receipt,
        description: "Creator payout verification & processing"
      }
    ]
  },
  {
    id: "system-admin",
    name: "SYSTEM/ADMIN",
    icon: Settings,
    description: "System configuration & administration",
    items: [
      {
        name: "Neural Dashboard", 
        href: "/",
        icon: Shield,
        description: "Main command center with real-time metrics"
      },
      {
        name: "Analytics Dashboard",
        href: "/analytics",
        icon: BarChart3,
        description: "Performance metrics & compliance reporting"
      },
      {
        name: "SEO Configuration",
        href: "/seo-configuration",
        icon: Search,
        description: "Search engine optimization settings"
      },
      {
        name: "AEO Configuration", 
        href: "/aeo-configuration",
        icon: Brain,
        description: "Answer Engine Optimization for AI platforms"
      },
      {
        name: "System Settings",
        href: "/settings",
        icon: Settings,
        description: "Platform configuration & security settings",
        requiresSuperAdmin: true
      }
    ]
  }
];

export function CategorizedNavigation() {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['media-content', 'compliance-legal']);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Simulate user role - in real implementation, this would come from auth context
  const userRole = "COMPLIANCE_OFFICER"; // MODERATOR, 2257_OFFICER, COMPLIANCE_OFFICER, SECURITY_OFFICER, CRISIS_MANAGER, LEGAL_TEAM, SUPER_ADMIN
  const isSuperAdmin = false; // Would be determined from user context

  const canAccessItem = (item: NavigationItem) => {
    if (item.requiresSuperAdmin && !isSuperAdmin) return false;
    if (!item.requiresCompliance) return true;
    
    // Role hierarchy check
    const roleHierarchy = {
      'MODERATOR': 1,
      '2257_OFFICER': 2,
      'COMPLIANCE_OFFICER': 3,
      'SECURITY_OFFICER': 3,
      'CRISIS_MANAGER': 4,
      'LEGAL_TEAM': 5,
      'SUPER_ADMIN': 6
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const requiredLevel = roleHierarchy[item.complianceLevel as keyof typeof roleHierarchy] || 1;
    
    return userLevel >= requiredLevel;
  };

  return (
    <nav className="w-80 min-h-screen bg-black/90 border-r border-primary/20 backdrop-blur-xl cyber-border">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center cyber-pulse">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold cyber-text-glow">FanzDash</h1>
            <p className="text-xs text-muted-foreground">Enterprise Creator Platform</p>
            <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400 mt-1">
              {userRole.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Categorized Navigation Items */}
        <div className="space-y-2">
          {navigationCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const CategoryIcon = category.icon;
            
            return (
              <div key={category.id} className="space-y-1">
                {/* Category Header */}
                <Button
                  variant="ghost"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full justify-start p-3 text-left hover:bg-primary/10 cyber-border-subtle"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <CategoryIcon className="w-4 h-4 text-cyan-400" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-cyan-400">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.description}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </Button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="ml-4 space-y-1 border-l border-primary/20">
                    {category.items.map((item) => {
                      if (!canAccessItem(item)) return null;
                      
                      const isActive = location === item.href;
                      const Icon = item.icon;
                      
                      return (
                        <Link key={item.href} href={item.href}>
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start ml-4 h-auto py-2 px-3 text-left group transition-all duration-300",
                              isActive 
                                ? "bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50 cyber-glow" 
                                : "hover:bg-primary/10 hover:border-primary/30",
                              item.requiresCompliance && "border-l-2 border-l-amber-500",
                              item.requiresSuperAdmin && "border-l-2 border-l-red-500"
                            )}
                            data-testid={`nav-${item.href.replace('/', '')}`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              <Icon className={cn(
                                "w-4 h-4 transition-colors duration-200",
                                isActive ? "text-white" : "text-gray-400 group-hover:text-cyan-400"
                              )} />
                              <div className="flex-1 min-w-0">
                                <div className={cn(
                                  "text-sm font-medium truncate transition-colors duration-200",
                                  isActive ? "text-white cyber-text-glow" : "text-gray-300 group-hover:text-white"
                                )}>
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {item.description}
                                </div>
                                {(item.requiresCompliance || item.requiresSuperAdmin) && (
                                  <div className="flex gap-1 mt-1">
                                    {item.requiresCompliance && (
                                      <Badge variant="outline" className="text-xs py-0 px-1 text-amber-400 border-amber-400">
                                        {item.complianceLevel?.replace('_', ' ') || 'COMPLIANCE'}
                                      </Badge>
                                    )}
                                    {item.requiresSuperAdmin && (
                                      <Badge variant="outline" className="text-xs py-0 px-1 text-red-400 border-red-400">
                                        SUPER ADMIN
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Compliance Notice */}
        <div className="mt-8 p-4 border border-amber-500/30 rounded-lg bg-amber-500/5">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-amber-400">COMPLIANCE NOTICE</div>
              <div className="text-xs text-amber-300 mt-1">
                Actions marked with compliance badges require proper authorization and create immutable audit logs per 18 U.S.C. § 2257 requirements.
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}