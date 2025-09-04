import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  Smartphone,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Github,
  Linkedin,
} from "lucide-react";

interface FooterProps {
  currentUser?: {
    id: string;
    darkMode: boolean;
  };
  settings: {
    title: string;
    logo: string;
    logo2: string;
    company: string;
    address: string;
    city: string;
    country: string;
    showAddressCompanyFooter: boolean;
    disableContact: boolean;
    disableCreatorsSection: boolean;
    footerBackgroundColor: string;
    footerTextColor: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    github?: string;
    linkedin?: string;
    tiktok?: string;
    telegram?: string;
  };
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    access: "all" | "creators" | "members";
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    abbreviation: string;
  }>;
  currentLanguage: string;
  blogsCount: number;
  categoriesCount: number;
  className?: string;
}

export function Footer({
  currentUser,
  settings,
  pages,
  categories,
  languages,
  currentLanguage,
  blogsCount,
  categoriesCount,
  className = "",
}: FooterProps) {
  const logoUrl = currentUser?.darkMode
    ? `/public/img/${settings.logo}`
    : `/public/img/${settings.logo2}`;

  const hasSocialMedia = !!(
    settings.facebook ||
    settings.twitter ||
    settings.instagram ||
    settings.youtube ||
    settings.github ||
    settings.linkedin ||
    settings.tiktok ||
    settings.telegram
  );

  const accessiblePages = pages.filter((page) => {
    if (page.access === "all") return true;
    if (page.access === "creators" && currentUser) return true; // Simplified check
    if (page.access === "members" && currentUser) return true;
    return false;
  });

  return (
    <footer className={`py-8 ${className}`}>
      {/* Main Footer */}
      <div
        className="py-12 hidden lg:block"
        style={{
          backgroundColor: settings.footerBackgroundColor,
          color: settings.footerTextColor,
        }}
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Social */}
            <div className="col-span-1">
              <Link href="/">
                <img
                  src={logoUrl}
                  alt={settings.title}
                  className="max-w-32 mb-4"
                />
              </Link>

              {hasSocialMedia && (
                <div>
                  <p className="mb-3 text-sm">
                    Keep connected with us. Follow us on social media.
                  </p>
                  <div className="flex space-x-3">
                    {settings.facebook && (
                      <a
                        href={settings.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                    )}
                    {settings.twitter && (
                      <a
                        href={settings.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {settings.instagram && (
                      <a
                        href={settings.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                    {settings.youtube && (
                      <a
                        href={settings.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Youtube className="h-5 w-5" />
                      </a>
                    )}
                    {settings.github && (
                      <a
                        href={settings.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                    {settings.linkedin && (
                      <a
                        href={settings.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* PWA Install Button */}
              <div id="installContainer" className="mt-4 hidden">
                <Button
                  id="butInstall"
                  className="w-full rounded-full"
                  variant="outline"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Install Web App
                </Button>
              </div>
            </div>

            {/* About Pages */}
            <div className="col-span-1">
              <h6 className="text-sm font-semibold uppercase mb-4">About</h6>
              <ul className="space-y-2">
                {accessiblePages.map((page) => (
                  <li key={page.id}>
                    <Link href={`/p/${page.slug}`}>
                      <span className="text-sm hover:underline cursor-pointer">
                        {page.title}
                      </span>
                    </Link>
                  </li>
                ))}

                {!settings.disableContact && (
                  <li>
                    <Link href="/contact">
                      <span className="text-sm hover:underline cursor-pointer">
                        Contact
                      </span>
                    </Link>
                  </li>
                )}

                {blogsCount > 0 && (
                  <li>
                    <Link href="/blog">
                      <span className="text-sm hover:underline cursor-pointer">
                        Blog
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Categories */}
            {!settings.disableCreatorsSection && categoriesCount > 0 && (
              <div className="col-span-1">
                <h6 className="text-sm font-semibold uppercase mb-4">
                  Categories
                </h6>
                <ul className="space-y-2">
                  {categories.slice(0, 6).map((category) => (
                    <li key={category.id}>
                      <Link href={`/category/${category.slug}`}>
                        <span className="text-sm hover:underline cursor-pointer">
                          {category.name}
                        </span>
                      </Link>
                    </li>
                  ))}

                  {categoriesCount > 6 && (
                    <li>
                      <Link href="/creators">
                        <span className="text-sm hover:underline cursor-pointer">
                          Explore →
                        </span>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Links */}
            <div className="col-span-1">
              <h6 className="text-sm font-semibold uppercase mb-4">Links</h6>
              <ul className="space-y-2">
                {!currentUser ? (
                  <>
                    <li>
                      <Link href="/login">
                        <span className="text-sm hover:underline cursor-pointer">
                          Login
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/register">
                        <span className="text-sm hover:underline cursor-pointer">
                          Sign Up
                        </span>
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/dashboard">
                        <span className="text-sm hover:underline cursor-pointer">
                          My Dashboard
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/settings/page">
                        <span className="text-sm hover:underline cursor-pointer">
                          Edit Profile
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/my/subscriptions">
                        <span className="text-sm hover:underline cursor-pointer">
                          My Subscriptions
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/logout">
                        <span className="text-sm hover:underline cursor-pointer">
                          Logout
                        </span>
                      </Link>
                    </li>
                  </>
                )}

                {/* Language Selector for guests */}
                {!currentUser && languages.length > 1 && (
                  <li className="mt-4">
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {
                          languages.find(
                            (lang) => lang.abbreviation === currentLanguage,
                          )?.name
                        }
                      </Button>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div
        className="py-4 text-center border-t"
        style={{
          backgroundColor: settings.footerBackgroundColor,
          color: settings.footerTextColor,
        }}
      >
        <div className="container mx-auto px-4">
          {/* Mobile Footer (hidden on large screens) */}
          <div className="lg:hidden mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                &copy; {new Date().getFullYear()} {settings.title}, All rights
                reserved.
              </p>

              <div className="flex flex-wrap justify-center gap-4 text-xs">
                {accessiblePages.slice(0, 4).map((page) => (
                  <Link key={page.id} href={`/p/${page.slug}`}>
                    <span className="hover:underline cursor-pointer">
                      {page.title}
                    </span>
                  </Link>
                ))}

                {!settings.disableContact && (
                  <Link href="/contact">
                    <span className="hover:underline cursor-pointer">
                      Contact
                    </span>
                  </Link>
                )}

                {blogsCount > 0 && (
                  <Link href="/blog">
                    <span className="hover:underline cursor-pointer">Blog</span>
                  </Link>
                )}
              </div>

              {/* PWA Install for mobile */}
              <div id="installContainer" className="mt-4 hidden">
                <span className="text-sm hover:underline cursor-pointer">
                  <Smartphone className="h-4 w-4 inline mr-1" />
                  Install Web App
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Copyright */}
          <div className="hidden lg:block">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} {settings.title}, All rights
              reserved.
              {settings.showAddressCompanyFooter && (
                <span className="ml-2 text-xs">
                  {settings.company} - Address: {settings.address}{" "}
                  {settings.city} {settings.country}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
