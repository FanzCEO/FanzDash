/**
 * SEO utilities for optimizing pages and generating meta data
 */

export interface PageSEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  structuredData?: any;
}

/**
 * Generate optimized page title following best practices
 */
export function generatePageTitle(
  pageTitle: string,
  includeSubtitle = true,
): string {
  const baseTitle = "FanzDash";
  const subtitle = "Enterprise Creator Economy Platform";

  if (includeSubtitle) {
    return `${pageTitle} | ${baseTitle} - ${subtitle}`;
  }

  return `${pageTitle} | ${baseTitle}`;
}

/**
 * Generate meta description optimized for search engines
 */
export function generateMetaDescription(
  content: string,
  maxLength = 155,
): string {
  if (content.length <= maxLength) {
    return content;
  }

  // Truncate at word boundary
  const truncated = content.substring(0, maxLength).replace(/\s+\S*$/, "");
  return `${truncated}...`;
}

/**
 * Generate keywords array from content and predefined terms
 */
export function generateKeywords(
  pageSpecificKeywords: string[] = [],
): string[] {
  const baseKeywords = [
    "creator platform",
    "content management",
    "live streaming",
    "monetization",
    "fan engagement",
  ];

  return [...baseKeywords, ...pageSpecificKeywords];
}

/**
 * Admin page SEO configurations
 */
export const adminPageSEO = {
  systemConfiguration: {
    title: "System Configuration",
    description:
      "Configure system-wide settings for your creator platform including security, performance, uploads, and content management options.",
    keywords: [
      "system settings",
      "platform configuration",
      "security settings",
      "performance optimization",
    ] as string[],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "System Configuration",
      description:
        "Enterprise system configuration panel for creator platform management",
      mainEntity: {
        "@type": "SoftwareApplication",
        name: "FanzDash System Configuration",
        applicationCategory: "BusinessApplication",
      },
    },
  },

  logoFaviconManagement: {
    title: "Logo & Favicon Management",
    description:
      "Manage your brand logos and website favicons across all devices and platforms. Upload, optimize, and configure branding elements.",
    keywords: [
      "logo management",
      "favicon upload",
      "branding",
      "website icons",
      "brand identity",
    ] as string[],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Logo & Favicon Management",
      description: "Brand management interface for logos and favicons",
      mainEntity: {
        "@type": "CreativeWork",
        name: "Brand Assets Management System",
      },
    },
  },

  paymentGatewaySetup: {
    title: "Payment Gateway Setup",
    description:
      "Configure and manage payment processors including Stripe, PayPal, cryptocurrency, and regional payment methods with fraud protection.",
    keywords: [
      "payment gateway",
      "stripe setup",
      "paypal integration",
      "payment processing",
      "fraud protection",
    ] as string[],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Payment Gateway Configuration",
      description: "Payment processor management and configuration interface",
      mainEntity: {
        "@type": "FinancialService",
        name: "Payment Gateway Management System",
      },
    },
  },

  kycVerificationSetup: {
    title: "KYC Verification Setup",
    description:
      "Configure know-your-customer verification requirements, compliance settings, and identity verification workflows for regulatory compliance.",
    keywords: [
      "KYC verification",
      "identity verification",
      "compliance",
      "AML",
      "regulatory requirements",
    ] as string[],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "KYC Verification Configuration",
      description: "Identity verification and compliance management system",
      mainEntity: {
        "@type": "Service",
        name: "KYC Verification System",
        serviceType: "Identity Verification",
      },
    },
  },

  seoConfiguration: {
    title: "SEO & AEO Configuration",
    description:
      "Optimize your platform for search engines and app stores with comprehensive SEO settings, meta tags, structured data, and performance optimization.",
    keywords: [
      "SEO settings",
      "search optimization",
      "meta tags",
      "structured data",
      "app store optimization",
    ] as string[],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "SEO Configuration Panel",
      description:
        "Search engine and app store optimization configuration interface",
      mainEntity: {
        "@type": "SoftwareApplication",
        name: "SEO Configuration System",
        applicationCategory: "DeveloperApplication",
      },
    },
  },
} as const;

/**
 * Generate breadcrumb data for admin pages
 */
export function generateAdminBreadcrumbs(currentPage: string) {
  const baseBreadcrumbs = [
    { label: "Dashboard", href: "/" },
    { label: "Admin Panel", href: "/admin" },
  ];

  const pageBreadcrumbs: Record<string, { label: string; href: string }> = {
    "system-configuration": {
      label: "System Configuration",
      href: "/system-configuration",
    },
    "logo-favicon-management": {
      label: "Logo & Favicon Management",
      href: "/logo-favicon-management",
    },
    "payment-gateway-setup": {
      label: "Payment Gateway Setup",
      href: "/payment-gateway-setup",
    },
    "kyc-verification-setup": {
      label: "KYC Verification Setup",
      href: "/kyc-verification-setup",
    },
    "seo-configuration": {
      label: "SEO Configuration",
      href: "/seo-configuration",
    },
  };

  if (pageBreadcrumbs[currentPage]) {
    return [
      ...baseBreadcrumbs,
      { ...pageBreadcrumbs[currentPage], current: true },
    ];
  }

  return baseBreadcrumbs;
}

/**
 * Performance optimization hints for pages
 */
export const performanceOptimizations = {
  lazyLoadImages: {
    loading: "lazy" as const,
    decoding: "async" as const,
  },

  preloadCriticalResources: [
    {
      rel: "preload",
      href: "/fonts/inter.woff2",
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    },
    { rel: "preload", href: "/css/critical.css", as: "style" },
  ],

  prefetchResources: [
    { rel: "prefetch", href: "/api/user/profile" },
    { rel: "prefetch", href: "/api/system/status" },
  ],
};

/**
 * Social media optimization
 */
export function generateSocialMediaMeta(data: PageSEOData) {
  return {
    openGraph: {
      title: data.ogTitle || data.title,
      description: data.ogDescription || data.description,
      image: data.ogImage || "https://fanzdash.com/assets/og-image.jpg",
      type: "website",
      url: data.canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: data.ogTitle || data.title,
      description: data.ogDescription || data.description,
      image: data.ogImage || "https://fanzdash.com/assets/og-image.jpg",
      site: "@fanzdash",
    },
  };
}

/**
 * Generate structured data for admin pages
 */
export function generateAdminPageStructuredData(
  pageType: keyof typeof adminPageSEO,
) {
  const baseData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: `https://fanzdash.com/${pageType.replace(/([A-Z])/g, "-$1").toLowerCase()}`,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "WebSite",
      name: "FanzDash",
      url: "https://fanzdash.com",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: generateAdminBreadcrumbs(
        pageType.replace(/([A-Z])/g, "-$1").toLowerCase(),
      ).map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(item.href && { item: `https://fanzdash.com${item.href}` }),
      })),
    },
  };

  return {
    ...baseData,
    ...adminPageSEO[pageType]?.structuredData,
  };
}

/**
 * Check if content meets SEO best practices
 */
export function validateSEOContent(data: PageSEOData) {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Title validation
  if (!data.title) {
    issues.push("Page title is required");
  } else if (data.title.length < 30) {
    warnings.push("Page title is too short (< 30 characters)");
  } else if (data.title.length > 60) {
    warnings.push("Page title is too long (> 60 characters)");
  }

  // Description validation
  if (!data.description) {
    issues.push("Meta description is required");
  } else if (data.description.length < 120) {
    warnings.push("Meta description is too short (< 120 characters)");
  } else if (data.description.length > 160) {
    warnings.push("Meta description is too long (> 160 characters)");
  }

  // Keywords validation
  if (!data.keywords || data.keywords.length === 0) {
    warnings.push("No keywords specified");
  } else if (data.keywords.length > 10) {
    warnings.push("Too many keywords (> 10)");
  }

  return {
    issues,
    warnings,
    score: calculateSEOScore(data, issues, warnings),
  };
}

/**
 * Calculate SEO score based on content
 */
function calculateSEOScore(
  data: PageSEOData,
  issues: string[],
  warnings: string[],
): number {
  let score = 100;

  // Deduct points for issues and warnings
  score -= issues.length * 20;
  score -= warnings.length * 10;

  // Bonus points for good practices
  if (data.title && data.title.length >= 30 && data.title.length <= 60) {
    score += 5;
  }

  if (
    data.description &&
    data.description.length >= 120 &&
    data.description.length <= 160
  ) {
    score += 5;
  }

  if (data.keywords && data.keywords.length >= 3 && data.keywords.length <= 7) {
    score += 5;
  }

  if (data.structuredData) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}
