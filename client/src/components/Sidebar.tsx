import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "fas fa-tachometer-alt" },
  { name: "Media Review", href: "/media", icon: "fas fa-images" },
  { name: "Text Moderation", href: "/text", icon: "fas fa-comments" },
  { name: "Live Streams", href: "/streams", icon: "fas fa-video" },
  { name: "Review Queue", href: "/queue", icon: "fas fa-clock" },
  { name: "Appeals", href: "/appeals", icon: "fas fa-gavel" },
  { name: "Settings", href: "/settings", icon: "fas fa-cog" },
  { name: "Audit Logs", href: "/logs", icon: "fas fa-file-alt" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-slate-900">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <i className="fas fa-shield-alt text-white text-lg"></i>
              </div>
              <h1 className="text-xl font-bold text-white">FanzDash</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  location === item.href
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <i
                  className={cn(
                    item.icon,
                    "mr-3 flex-shrink-0 h-6 w-6 text-slate-400",
                  )}
                />
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 flex bg-slate-800 p-4 border-t border-slate-700">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Sarah Chen</p>
                  <p className="text-xs font-medium text-slate-300">
                    Senior Moderator
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
