import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Search,
  Menu,
  X,
  Home,
  Compass,
  ShoppingBag,
  MessageCircle,
  Bell,
  MoreHorizontal,
  Settings,
  LogOut,
  Sun,
  Moon,
  User,
  LayoutDashboard,
  Feather,
  Bookmark,
  Heart,
  DollarSign,
  Wallet,
  Users,
  UserCheck,
  Star,
  Shield,
  Verified,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  coverImage?: string;
  isVerified: boolean;
  isAdmin: boolean;
  darkMode: boolean;
  balance: number;
  wallet: number;
  unreadMessages: number;
  unseenNotifications: number;
}

interface SearchResult {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  isLive?: boolean;
}

interface EnhancedNavbarProps {
  user?: User;
  isGuest: boolean;
  settings: {
    title: string;
    logo: string;
    logo2: string;
    homeStyle: number;
    disableCreatorsSection: boolean;
    disableSearch: boolean;
    shop: boolean;
    registrationActive: boolean;
    showLoginModal: boolean;
    currencySymbol: string;
    walletEnabled: boolean;
    walletFormat: string;
  };
  onSearch: (query: string) => Promise<SearchResult[]>;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onToggleDarkMode: () => void;
  className?: string;
}

export function EnhancedNavbar({
  user,
  isGuest,
  settings,
  onSearch,
  onLogin,
  onRegister,
  onLogout,
  onToggleDarkMode,
  className = "",
}: EnhancedNavbarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = location === "/" && settings.homeStyle === 0;
  const isLivePage = location.startsWith("/live/");
  const isMessagesPage = location.startsWith("/messages");

  useEffect(() => {
    const searchDelayed = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true);
        try {
          const results = await onSearch(searchQuery);
          setSearchResults(results);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setShowSearchDropdown(false);
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(searchDelayed);
  }, [searchQuery, onSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/creators?q=${encodeURIComponent(searchQuery)}`;
      setShowSearchDropdown(false);
    }
  };

  const MobileMenuItem = ({
    icon: Icon,
    label,
    href,
    onClick,
    badge,
    disabled = false,
  }: {
    icon: any;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: number;
    disabled?: boolean;
  }) => (
    <div className="border-b py-2">
      {href ? (
        <Link href={href}>
          <Button
            variant="ghost"
            className="w-full justify-start py-3 px-4"
            onClick={() => setMobileMenuOpen(false)}
            disabled={disabled}
            data-testid={`mobile-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className="flex items-center space-x-3">
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {badge && badge > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {badge > 99 ? "99+" : badge}
                </Badge>
              )}
            </div>
          </Button>
        </Link>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start py-3 px-4"
          onClick={() => {
            onClick?.();
            setMobileMenuOpen(false);
          }}
          disabled={disabled}
          data-testid={`mobile-action-${label.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </div>
        </Button>
      )}
    </div>
  );

  return (
    <header className={cn("sticky top-0 z-50", className)}>
      <nav
        className={cn(
          "navbar px-4 py-3 transition-all duration-200",
          isLivePage ? "hidden" : "",
          isMessagesPage ? "hidden lg:block shadow-sm" : "shadow-lg",
          isHomePage && isGuest
            ? "bg-transparent backdrop-blur-md"
            : user?.darkMode
              ? "bg-white"
              : "bg-background",
          "border-b",
        )}
      >
        <div className="container-fluid flex items-center justify-between">
          {/* Mobile Menu Toggle (authenticated users) */}
          {user && (
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    data-testid="mobile-menu-toggle"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="space-y-4">
                    {/* User Profile Section */}
                    {user && (
                      <div className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <h6 className="font-semibold text-sm truncate">
                              {user.name}
                            </h6>
                            {user.isVerified && (
                              <Verified className="h-4 w-4 text-blue-500 fill-current" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Admin Panel */}
                    {user?.isAdmin && (
                      <MobileMenuItem
                        icon={Shield}
                        label="Admin Panel"
                        href="/panel/admin"
                      />
                    )}

                    {/* Navigation Items */}
                    <MobileMenuItem
                      icon={User}
                      label={user?.isVerified ? "My Page" : "My Profile"}
                      href={user ? `/${user.username}` : "/login"}
                    />

                    {user?.isVerified && (
                      <>
                        <MobileMenuItem
                          icon={LayoutDashboard}
                          label="Dashboard"
                          href="/dashboard"
                        />
                        <MobileMenuItem
                          icon={Feather}
                          label="My Posts"
                          href="/my/posts"
                        />
                      </>
                    )}

                    <MobileMenuItem
                      icon={Bookmark}
                      label="Bookmarks"
                      href="/my/bookmarks"
                    />
                    <MobileMenuItem
                      icon={Heart}
                      label="Likes"
                      href="/my/likes"
                    />

                    {user?.isVerified && (
                      <MobileMenuItem
                        icon={DollarSign}
                        label={`Balance: ${settings.currencySymbol}${user.balance.toFixed(2)}`}
                      />
                    )}

                    {settings.walletEnabled && user && user.wallet > 0 && (
                      <MobileMenuItem
                        icon={Wallet}
                        label={`Wallet: ${settings.currencySymbol}${user.wallet.toFixed(2)}`}
                        href="/my/wallet"
                      />
                    )}

                    {user?.isVerified && (
                      <MobileMenuItem
                        icon={Users}
                        label="My Subscribers"
                        href="/my/subscribers"
                      />
                    )}

                    <MobileMenuItem
                      icon={UserCheck}
                      label="My Subscriptions"
                      href="/my/subscriptions"
                    />
                    <MobileMenuItem
                      icon={ShoppingBag}
                      label="Purchased"
                      href="/my/purchases"
                    />

                    {!user?.isVerified && (
                      <MobileMenuItem
                        icon={Star}
                        label="Become Creator"
                        href="/settings/verify/account"
                      />
                    )}

                    <MobileMenuItem
                      icon={user?.darkMode ? Sun : Moon}
                      label={user?.darkMode ? "Light Mode" : "Dark Mode"}
                      onClick={onToggleDarkMode}
                    />

                    <MobileMenuItem
                      icon={LogOut}
                      label="Logout"
                      onClick={onLogout}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          {/* Logo */}
          <Link href="/" className="navbar-brand">
            <img
              src={`/public/img/${
                user?.darkMode
                  ? settings.logo
                  : isGuest && isHomePage
                    ? settings.logo
                    : settings.logo2
              }`}
              alt={settings.title}
              className="h-8 w-auto max-w-32 object-contain"
              data-testid="navbar-logo"
            />
          </Link>

          {/* Desktop Search (authenticated users) */}
          {user &&
            !settings.disableSearch &&
            !settings.disableCreatorsSection && (
              <div className="hidden lg:block flex-1 max-w-md mx-8 relative">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Find creators..."
                      className="pl-10 pr-4"
                      minLength={3}
                      data-testid="search-creators-input"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
                      data-testid="search-submit-btn"
                    >
                      <Search className="h-3 w-3" />
                    </Button>
                  </div>
                </form>

                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50">
                    {isSearching && (
                      <div className="p-4 text-center">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                      </div>
                    )}

                    {!isSearching && searchResults.length > 0 && (
                      <div className="max-h-64 overflow-y-auto">
                        {searchResults.map((result) => (
                          <Link
                            key={result.id}
                            href={`/${result.username}`}
                            onClick={() => {
                              setShowSearchDropdown(false);
                              setSearchQuery("");
                            }}
                          >
                            <div className="flex items-center space-x-3 p-3 hover:bg-muted transition-colors">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={result.avatar} />
                                <AvatarFallback>
                                  {result.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-1">
                                  <span className="font-semibold text-sm">
                                    {result.name}
                                  </span>
                                  {result.isVerified && (
                                    <Verified className="h-3 w-3 text-blue-500 fill-current" />
                                  )}
                                  {result.isLive && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      LIVE
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  @{result.username}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}

                        <div className="border-t p-2">
                          <Link
                            href={`/creators?q=${encodeURIComponent(searchQuery)}`}
                          >
                            <Button
                              variant="ghost"
                              className="w-full"
                              size="sm"
                            >
                              View All Results
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {!isSearching && searchResults.length === 0 && (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No creators found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          {/* Guest Menu Toggle */}
          {isGuest && (
            <Button
              variant="ghost"
              size="sm"
              className={cn("lg:hidden", isHomePage ? "text-white" : "")}
              onClick={() => setMobileMenuOpen(true)}
              data-testid="guest-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Guest Navigation */}
            {isGuest && (
              <>
                {!settings.disableCreatorsSection && (
                  <Link href="/creators">
                    <Button variant="ghost" size="sm" data-testid="nav-explore">
                      Explore
                    </Button>
                  </Link>
                )}

                {settings.shop && (
                  <Link href="/shop">
                    <Button variant="ghost" size="sm" data-testid="nav-shop">
                      Shop
                    </Button>
                  </Link>
                )}

                <Button
                  onClick={onLogin}
                  variant={settings.registrationActive ? "ghost" : "default"}
                  size="sm"
                  data-testid="nav-login-btn"
                >
                  Login
                </Button>

                {settings.registrationActive && (
                  <Button
                    onClick={onRegister}
                    variant="default"
                    size="sm"
                    className={cn(
                      isHomePage ? "bg-white text-black hover:bg-gray-100" : "",
                    )}
                    data-testid="nav-register-btn"
                  >
                    Get Started
                  </Button>
                )}
              </>
            )}

            {/* Authenticated User Navigation */}
            {user && (
              <>
                <Link href="/">
                  <Button variant="ghost" size="sm" data-testid="nav-home">
                    <Home className="h-4 w-4" />
                  </Button>
                </Link>

                {!settings.disableCreatorsSection && (
                  <Link href="/creators">
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="nav-creators"
                    >
                      <Compass className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                {settings.shop && (
                  <Link href="/shop">
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="nav-shop-desktop"
                    >
                      <ShoppingBag className="h-4 w-4" />
                    </Button>
                  </Link>
                )}

                <Link href="/messages">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    data-testid="nav-messages"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {user.unreadMessages > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {user.unreadMessages > 99 ? "99+" : user.unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>

                <Link href="/notifications">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative"
                    data-testid="nav-notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {user.unseenNotifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {user.unseenNotifications > 99
                          ? "99+"
                          : user.unseenNotifications}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="relative"
                      data-testid="user-menu-trigger"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <MoreHorizontal className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            @{user.username}
                          </p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href={`/${user.username}`}>
                        <User className="h-4 w-4 mr-2" />
                        {user.isVerified ? "My Page" : "My Profile"}
                      </Link>
                    </DropdownMenuItem>

                    {user.isVerified && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">
                          <LayoutDashboard className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onToggleDarkMode}>
                      {user.darkMode ? (
                        <Sun className="h-4 w-4 mr-2" />
                      ) : (
                        <Moon className="h-4 w-4 mr-2" />
                      )}
                      {user.darkMode ? "Light Mode" : "Dark Mode"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={onLogout}
                      className="text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default EnhancedNavbar;
