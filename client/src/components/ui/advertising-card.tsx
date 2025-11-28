import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye } from "lucide-react";

interface AdvertisingCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  impressions?: number;
  className?: string;
}

export function AdvertisingCard({
  id,
  title,
  description,
  image,
  url,
  impressions = 0,
  className = "",
}: AdvertisingCardProps) {
  const handleClick = () => {
    // Track click and redirect
    fetch(`/api/ads/${id}/click`, { method: "POST" });
    window.open(url, "_blank");
  };

  return (
    <Card
      className={`cyber-border relative cursor-pointer hover:shadow-lg transition-shadow ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-32 h-20 object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/api/placeholder/150/100";
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm mb-1 truncate">{title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {description}
            </p>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Advertising
              </Badge>

              {impressions > 0 && (
                <span className="text-xs text-muted-foreground">
                  {impressions.toLocaleString()} views
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Invisible click area */}
        <button
          onClick={handleClick}
          className="absolute inset-0 w-full h-full"
          aria-label={`Visit ${title} advertisement`}
          data-testid={`ad-${id}`}
        />
      </CardContent>
    </Card>
  );
}

export default AdvertisingCard;
