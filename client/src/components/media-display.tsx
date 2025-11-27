import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Download,
  ExternalLink,
  FileArchive,
  Book,
  Music,
  Gift,
  Coins,
  ArrowUpRight,
} from "lucide-react";

interface MediaItem {
  id: string;
  type: "image" | "video" | "audio" | "zip" | "epub";
  file: string;
  fileName?: string;
  fileSize?: string;
  width?: number;
  height?: number;
  videoPoster?: string;
  preview?: string;
}

interface TipData {
  amount: number;
  currency: string;
}

interface GiftData {
  id: string;
  name: string;
  image: string;
  value: number;
}

interface MediaDisplayProps {
  media: MediaItem[];
  postId?: string;
  messageId?: string;
  tip?: TipData;
  gift?: GiftData;
  description?: string;
  isLocked?: boolean;
  onUnlock?: () => void;
  className?: string;
}

export function MediaDisplay({
  media,
  postId,
  messageId,
  tip,
  gift,
  description,
  isLocked = false,
  onUnlock,
  className = "",
}: MediaDisplayProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageVideoMedia = media.filter(
    (item) => item.type === "image" || item.type === "video",
  );
  const otherMedia = media.filter(
    (item) => item.type !== "image" && item.type !== "video",
  );

  const getMediaUrl = (item: MediaItem) => {
    if (messageId) {
      return item.type === "video"
        ? item.file
        : `/files/messages/${messageId}/${item.file}`;
    }

    if (postId) {
      return item.type === "video" ||
        (item.type === "image" && item.preview?.includes("gif"))
        ? item.file
        : `/files/storage/${postId}/${item.file}`;
    }

    return item.file;
  };

  const getImageUrl = (item: MediaItem, size = "w=960&h=980") => {
    const baseUrl = getMediaUrl(item);
    return item.type === "image" && !baseUrl.includes("gif")
      ? `${baseUrl}?${size}`
      : baseUrl;
  };

  // Single image/video display
  if (imageVideoMedia.length === 1) {
    const item = imageVideoMedia[0];

    return (
      <div className={className}>
        {item.type === "image" ? (
          <div className="media-grid-1 mb-4">
            <a
              href={getImageUrl(item)}
              className={`media-wrapper block w-full ${item.height && item.height > (item.width || 0) ? "aspect-[3/4]" : "aspect-video"}`}
              data-gallery={`gallery-${postId || messageId}`}
            >
              <img
                src={getImageUrl(item, "w=130&h=100")}
                data-src={getImageUrl(item)}
                alt={description}
                className="w-full h-full object-cover rounded-lg"
                width={item.width}
                height={item.height}
              />
            </a>
          </div>
        ) : (
          <div className="mb-4">
            <video
              controls
              preload={item.videoPoster ? "none" : "metadata"}
              poster={item.videoPoster}
              className="w-full rounded-lg"
            >
              <source src={getMediaUrl(item)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Other media types */}
        {otherMedia.map((item) => (
          <MediaItemDisplay key={item.id} item={item} messageId={messageId} />
        ))}

        {/* Special content */}
        <SpecialContent tip={tip} gift={gift} description={description} />
      </div>
    );
  }

  // Multiple images/videos grid
  if (imageVideoMedia.length >= 2) {
    const gridClass =
      imageVideoMedia.length > 4
        ? "media-grid-4"
        : `media-grid-${imageVideoMedia.length}`;

    return (
      <div className={className}>
        <div className="container-post-media mb-4">
          <div
            className={`grid gap-1 ${gridClass === "media-grid-2" ? "grid-cols-2" : gridClass === "media-grid-3" ? "grid-cols-3" : "grid-cols-2"} rounded-lg overflow-hidden`}
          >
            {imageVideoMedia
              .slice(0, imageVideoMedia.length > 4 ? 4 : imageVideoMedia.length)
              .map((item, index) => {
                const mediaUrl = getMediaUrl(item);
                const imageUrl = item.videoPoster || getImageUrl(item);

                return (
                  <a
                    key={item.id}
                    href={mediaUrl}
                    className="relative aspect-square group cursor-pointer"
                    data-gallery={`gallery-${postId || messageId}`}
                    style={{
                      backgroundImage: `url(${imageUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* More items indicator */}
                    {index === 3 && imageVideoMedia.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          +{imageVideoMedia.length - 4}
                        </span>
                      </div>
                    )}

                    {/* Video play button */}
                    {item.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/50 rounded-full p-3">
                          <Play className="h-6 w-6 text-white fill-current" />
                        </div>
                      </div>
                    )}

                    {/* Video without poster */}
                    {item.type === "video" && !item.videoPoster && (
                      <video
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        preload="metadata"
                      >
                        <source src={mediaUrl} type="video/mp4" />
                      </video>
                    )}
                  </a>
                );
              })}
          </div>
        </div>

        {/* Other media types */}
        {otherMedia.map((item) => (
          <MediaItemDisplay key={item.id} item={item} messageId={messageId} />
        ))}

        {/* Special content */}
        <SpecialContent tip={tip} gift={gift} description={description} />
      </div>
    );
  }

  // No images/videos, just other media and special content
  return (
    <div className={className}>
      {otherMedia.map((item) => (
        <MediaItemDisplay key={item.id} item={item} messageId={messageId} />
      ))}
      <SpecialContent tip={tip} gift={gift} description={description} />
    </div>
  );
}

function MediaItemDisplay({
  item,
  messageId,
}: {
  item: MediaItem;
  messageId?: string;
}) {
  const getDownloadUrl = () => {
    return messageId
      ? `/download/message/file/${messageId}`
      : `/download/file/${item.id}`;
  };

  const getViewerUrl = () => {
    return messageId
      ? `/viewer/message/epub/${item.id}`
      : `/viewer/epub/${item.id}`;
  };

  if (item.type === "audio") {
    return (
      <div className="wrapper-media-music mb-4">
        <audio controls preload="metadata" className="w-full">
          <source src={item.file} type="audio/mp3" />
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }

  if (item.type === "zip") {
    return (
      <Card className="mb-4">
        <CardContent className="p-0">
          <a
            href={getDownloadUrl()}
            className="flex items-center p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mr-4">
              <FileArchive className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h6 className="font-semibold text-primary truncate">
                {item.fileName || "Download"}.zip
              </h6>
              <p className="text-sm text-muted-foreground">
                {item.fileSize || "File"}
              </p>
            </div>
            <Download className="h-4 w-4 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>
    );
  }

  if (item.type === "epub") {
    return (
      <Card className="mb-4">
        <CardContent className="p-0">
          <a
            href={getViewerUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mr-4">
              <Book className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h6 className="font-semibold text-primary truncate">
                {item.fileName || "View Online"}.epub
              </h6>
              <p className="text-sm text-muted-foreground">
                <strong>View Online</strong>
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </a>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function SpecialContent({
  tip,
  gift,
  description,
}: {
  tip?: TipData;
  gift?: GiftData;
  description?: string;
}) {
  return (
    <>
      {/* Tip Display */}
      {tip && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-600">
              <Coins className="h-5 w-5" />
              <span className="font-semibold">
                Tip - {tip.currency}
                {tip.amount}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gift Display */}
      {gift && (
        <Card className="mb-4 border-purple-200">
          <CardContent className="p-4">
            {gift.image && (
              <div className="text-center mb-3">
                <img
                  src={gift.image}
                  alt={gift.name}
                  className="w-24 h-24 mx-auto object-contain"
                />
              </div>
            )}
            <div className="flex items-center justify-center space-x-2 text-purple-600">
              <Gift className="h-5 w-5" />
              <span className="font-semibold">Gift - ${gift.value}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description for text-only content */}
      {description && !tip && !gift && (
        <div className="text-sm mb-4">
          <p className="break-words">{description}</p>
        </div>
      )}
    </>
  );
}

export default MediaDisplay;
