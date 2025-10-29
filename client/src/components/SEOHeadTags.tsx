import { useEffect } from "react";

interface SEOHeadTagsProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  schema?: any;
  noindex?: boolean;
  nofollow?: boolean;
}

export function SEOHeadTags({
  title = "FanzDash - Enterprise Creator Economy Platform",
  description = "Advanced creator economy platform supporting content management, live streaming, and monetization with enterprise-grade features",
  keywords = [
    "creator platform",
    "content management",
    "live streaming",
    "monetization",
    "fan engagement",
  ],
  canonicalUrl = "https://dash.myfanz.network",
  ogTitle,
  ogDescription,
  ogImage = "https://dash.myfanz.network/assets/og-image.jpg",
  ogType = "website",
  twitterCard = "summary_large_image",
  twitterSite = "@fanzdash",
  author = "FanzDash Team",
  publishedTime,
  modifiedTime,
  schema,
  noindex = false,
  nofollow = false,
}: SEOHeadTagsProps) {
  useEffect(() => {
    // Set document title
    document.title = title;

    // Clear existing meta tags that we'll be replacing
    const existingTags = document.querySelectorAll(
      'meta[name="description"], meta[name="keywords"], meta[name="author"], ' +
        'meta[property^="og:"], meta[name^="twitter:"], meta[name="robots"], ' +
        'link[rel="canonical"], script[type="application/ld+json"]',
    );
    existingTags.forEach((tag) => tag.remove());

    // Create and append new meta tags
    const head = document.head;

    // Basic SEO Meta Tags
    const metaDescription = document.createElement("meta");
    metaDescription.name = "description";
    metaDescription.content = description;
    head.appendChild(metaDescription);

    if (keywords.length > 0) {
      const metaKeywords = document.createElement("meta");
      metaKeywords.name = "keywords";
      metaKeywords.content = keywords.join(", ");
      head.appendChild(metaKeywords);
    }

    const metaAuthor = document.createElement("meta");
    metaAuthor.name = "author";
    metaAuthor.content = author;
    head.appendChild(metaAuthor);

    // Robots meta tag
    const robotsContent = [];
    if (noindex) robotsContent.push("noindex");
    if (nofollow) robotsContent.push("nofollow");
    if (robotsContent.length === 0) {
      robotsContent.push("index", "follow");
    }

    const metaRobots = document.createElement("meta");
    metaRobots.name = "robots";
    metaRobots.content = robotsContent.join(", ");
    head.appendChild(metaRobots);

    // Canonical URL
    if (canonicalUrl) {
      const linkCanonical = document.createElement("link");
      linkCanonical.rel = "canonical";
      linkCanonical.href = canonicalUrl;
      head.appendChild(linkCanonical);
    }

    // Open Graph Meta Tags
    const ogTags = {
      "og:title": ogTitle || title,
      "og:description": ogDescription || description,
      "og:image": ogImage,
      "og:type": ogType,
      "og:url": canonicalUrl,
      "og:site_name": "FanzDash",
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      if (content) {
        const metaOg = document.createElement("meta");
        metaOg.setAttribute("property", property);
        metaOg.content = content;
        head.appendChild(metaOg);
      }
    });

    // Twitter Card Meta Tags
    const twitterTags = {
      "twitter:card": twitterCard,
      "twitter:site": twitterSite,
      "twitter:title": ogTitle || title,
      "twitter:description": ogDescription || description,
      "twitter:image": ogImage,
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      if (content) {
        const metaTwitter = document.createElement("meta");
        metaTwitter.name = name;
        metaTwitter.content = content;
        head.appendChild(metaTwitter);
      }
    });

    // Article-specific meta tags
    if (publishedTime) {
      const metaPublished = document.createElement("meta");
      metaPublished.setAttribute("property", "article:published_time");
      metaPublished.content = publishedTime;
      head.appendChild(metaPublished);
    }

    if (modifiedTime) {
      const metaModified = document.createElement("meta");
      metaModified.setAttribute("property", "article:modified_time");
      metaModified.content = modifiedTime;
      head.appendChild(metaModified);
    }

    // Additional SEO meta tags
    const additionalTags = [
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#603cba" },
      { name: "msapplication-TileColor", content: "#603cba" },
      { name: "application-name", content: "FanzDash" },
      { name: "apple-mobile-web-app-title", content: "FanzDash" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "format-detection", content: "telephone=no" },
      { name: "mobile-web-app-capable", content: "yes" },
    ];

    additionalTags.forEach(({ name, content }) => {
      const existing = document.querySelector(`meta[name="${name}"]`);
      if (!existing) {
        const meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        head.appendChild(meta);
      }
    });

    // Structured Data (JSON-LD)
    if (schema || ogType === "website") {
      const structuredData = schema || {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "FanzDash",
        description: description,
        url: canonicalUrl,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${canonicalUrl}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        sameAs: [
          "https://twitter.com/fanzdash",
          "https://facebook.com/fanzdash",
          "https://instagram.com/fanzdash",
        ],
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      head.appendChild(script);
    }

    // Cleanup function
    return () => {
      // Clean up when component unmounts or dependencies change
      const tagsToClean = document.querySelectorAll(
        'meta[name="description"], meta[name="keywords"], meta[name="author"], ' +
          'meta[property^="og:"], meta[name^="twitter:"], meta[name="robots"], ' +
          'link[rel="canonical"], script[type="application/ld+json"]',
      );
      tagsToClean.forEach((tag) => tag.remove());
    };
  }, [
    title,
    description,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    ogType,
    twitterCard,
    twitterSite,
    author,
    publishedTime,
    modifiedTime,
    schema,
    noindex,
    nofollow,
  ]);

  return null; // This component doesn't render anything visible
}

// Breadcrumb Component for SEO
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface SEOBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function SEOBreadcrumbs({ items, className = "" }: SEOBreadcrumbsProps) {
  useEffect(() => {
    // Generate structured data for breadcrumbs
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(item.href && { item: item.href }),
      })),
    };

    // Remove existing breadcrumb schema
    const existingSchema = document.querySelector(
      "script[data-breadcrumb-schema]",
    );
    if (existingSchema) {
      existingSchema.remove();
    }

    // Add new breadcrumb schema
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-breadcrumb-schema", "true");
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const schemaElement = document.querySelector(
        "script[data-breadcrumb-schema]",
      );
      if (schemaElement) {
        schemaElement.remove();
      }
    };
  }, [items]);

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center space-x-2 text-sm text-muted-foreground ${className}`}
    >
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <span>/</span>}
          {item.href && !item.current ? (
            <a
              href={item.href}
              className="hover:text-foreground transition-colors"
              data-testid={`breadcrumb-${index}`}
            >
              {item.label}
            </a>
          ) : (
            <span
              className={item.current ? "text-foreground font-medium" : ""}
              data-testid={`breadcrumb-${index}`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

// Hook for dynamic SEO updates
export function useSEO(seoData: Partial<SEOHeadTagsProps>) {
  useEffect(() => {
    // Update title
    if (seoData.title) {
      document.title = seoData.title;
    }

    // Update meta description
    if (seoData.description) {
      let metaDesc = document.querySelector(
        'meta[name="description"]',
      ) as HTMLMetaElement;
      if (metaDesc) {
        metaDesc.content = seoData.description;
      }
    }

    // Update canonical URL
    if (seoData.canonicalUrl) {
      let canonical = document.querySelector(
        'link[rel="canonical"]',
      ) as HTMLLinkElement;
      if (canonical) {
        canonical.href = seoData.canonicalUrl;
      }
    }

    // Update Open Graph tags
    if (seoData.ogTitle) {
      let ogTitle = document.querySelector(
        'meta[property="og:title"]',
      ) as HTMLMetaElement;
      if (ogTitle) {
        ogTitle.content = seoData.ogTitle;
      }
    }

    if (seoData.ogDescription) {
      let ogDesc = document.querySelector(
        'meta[property="og:description"]',
      ) as HTMLMetaElement;
      if (ogDesc) {
        ogDesc.content = seoData.ogDescription;
      }
    }
  }, [seoData]);
}

export default SEOHeadTags;
