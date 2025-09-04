import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Lock,
  Unlock,
  Trash2,
  Download,
  FileArchive,
  Book,
  Music,
  Image as ImageIcon,
  Video,
  Gift,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MediaItem {
  id: string;
  type: "image" | "video" | "music" | "zip" | "epub";
  file: string;
  fileName?: string;
  fileSize?: string;
  videoPoster?: string;
  durationVideo?: string;
  qualityVideo?: string;
  width?: number;
  height?: number;
}

interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  senderName: string;
  senderAvatar: string;
  content?: string;
  media: MediaItem[];
  price: number;
  isPaid: boolean;
  tip?: {
    amount: number;
    currency: string;
  };
  giftId?: string;
  giftName?: string;
  giftImage?: string;
  giftValue?: number;
  createdAt: string;
  isOwn: boolean;
  canDelete: boolean;
}

interface MessagingChatProps {
  messages: Message[];
  currentUserId: string;
  canLoadMore: boolean;
  onLoadMore: () => void;
  onUnlockMessage: (messageId: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onDownloadFile: (messageId: string, fileId: string) => void;
  settings: {
    currencySymbol: string;
    canDeleteMessages: boolean;
  };
  className?: string;
}

export function MessagingChat({
  messages,
  currentUserId,
  canLoadMore,
  onLoadMore,
  onUnlockMessage,
  onDeleteMessage,
  onDownloadFile,
  settings,
  className = "",
}: MessagingChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleUnlock = async (messageId: string) => {
    setIsLoading(true);
    try {
      await onUnlockMessage(messageId);
    } catch (error) {
      console.error("Failed to unlock message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMediaStats = (media: MediaItem[]) => {
    const stats = {
      images: media.filter((m) => m.type === "image").length,
      videos: media.filter((m) => m.type === "video").length,
      audio: media.filter((m) => m.type === "music").length,
      files: media.filter((m) => m.type === "zip" || m.type === "epub").length,
    };
    return stats;
  };

  const MessageContent = ({ message }: { message: Message }) => {
    const isLocked = message.price > 0 && !message.isPaid;
    const mediaStats = getMediaStats(message.media);
    const hasImageOrVideo = message.media.some(
      (m) => m.type === "image" || m.type === "video",
    );
    const firstMedia = message.media.find(
      (m) => m.type === "image" || m.type === "video",
    );

    if (isLocked) {
      return (
        <Card className="max-w-md">
          <CardContent
            className="p-4 text-center text-white relative overflow-hidden"
            style={{
              background: firstMedia
                ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${firstMedia.videoPoster || firstMedia.file})`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="space-y-3">
              <div className="flex justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>

              <Button
                onClick={() => handleUnlock(message.id)}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100"
                data-testid={`unlock-message-${message.id}`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Unlock for {settings.currencySymbol}
                    {message.price}
                  </>
                )}
              </Button>

              {/* Media type indicators */}
              <div className="flex justify-center space-x-4 text-sm">
                {message.content && !hasImageOrVideo && (
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>Text</span>
                  </div>
                )}

                {mediaStats.images > 0 && (
                  <div className="flex items-center space-x-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>{mediaStats.images}</span>
                  </div>
                )}

                {mediaStats.videos > 0 && (
                  <div className="flex items-center space-x-1">
                    <Video className="h-3 w-3" />
                    <span>{mediaStats.videos}</span>
                    {message.media.find(
                      (m) => m.type === "video" && m.qualityVideo,
                    ) && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {
                          message.media.find((m) => m.type === "video")
                            ?.qualityVideo
                        }
                      </Badge>
                    )}
                  </div>
                )}

                {mediaStats.audio > 0 && (
                  <div className="flex items-center space-x-1">
                    <Music className="h-3 w-3" />
                    <span>{mediaStats.audio}</span>
                  </div>
                )}

                {mediaStats.files > 0 && (
                  <div className="flex items-center space-x-1">
                    <FileArchive className="h-3 w-3" />
                    <span>
                      {message.media.find((m) => m.type === "zip")?.fileSize ||
                        "File"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {/* Media Content */}
        {message.media.length > 0 && (
          <div className="space-y-2">
            {message.media.map((media) => (
              <MediaDisplay
                key={media.id}
                media={media}
                messageId={message.id}
                onDownload={() => onDownloadFile(message.id, media.id)}
              />
            ))}
          </div>
        )}

        {/* Text Content */}
        {message.content && (
          <div
            className={`p-3 rounded-lg max-w-md break-words ${
              message.isOwn
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            }`}
          >
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>
        )}

        {/* Tip Display */}
        {message.tip && (
          <Card className="max-w-sm border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-green-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold">
                  Tip - {message.tip.currency}
                  {message.tip.amount}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gift Display */}
        {message.giftId && (
          <Card className="max-w-sm border-purple-200 bg-purple-50">
            <CardContent className="p-3">
              {message.giftImage && (
                <div className="text-center mb-2">
                  <img
                    src={message.giftImage}
                    alt={message.giftName}
                    className="w-16 h-16 mx-auto object-contain"
                  />
                </div>
              )}
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <Gift className="h-4 w-4" />
                <span className="font-semibold">
                  Gift - {settings.currencySymbol}
                  {message.giftValue}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const MediaDisplay = ({
    media,
    messageId,
    onDownload,
  }: {
    media: MediaItem;
    messageId: string;
    onDownload: () => void;
  }) => {
    switch (media.type) {
      case "image":
        return (
          <div className="max-w-sm">
            <img
              src={`/files/messages/${messageId}/${media.file}`}
              alt="Shared image"
              className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() =>
                window.open(
                  `/files/messages/${messageId}/${media.file}`,
                  "_blank",
                )
              }
            />
          </div>
        );

      case "video":
        return (
          <div className="max-w-sm">
            <video
              controls
              poster={media.videoPoster}
              className="w-full rounded-lg"
              preload="metadata"
            >
              <source
                src={`/files/messages/${messageId}/${media.file}`}
                type="video/mp4"
              />
            </video>
          </div>
        );

      case "music":
        return (
          <Card className="max-w-sm">
            <CardContent className="p-3">
              <audio controls className="w-full">
                <source
                  src={`/files/messages/${messageId}/${media.file}`}
                  type="audio/mp3"
                />
              </audio>
            </CardContent>
          </Card>
        );

      case "zip":
        return (
          <Card className="max-w-sm">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={onDownload}
                className="w-full p-4 h-auto justify-start"
                data-testid={`download-zip-${media.id}`}
              >
                <FileArchive className="h-8 w-8 text-primary mr-3" />
                <div className="text-left">
                  <h6 className="font-semibold text-primary">
                    {media.fileName || "Download"}.zip
                  </h6>
                  <p className="text-sm text-muted-foreground">
                    {media.fileSize || "File"}
                  </p>
                </div>
                <Download className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        );

      case "epub":
        return (
          <Card className="max-w-sm">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                onClick={() =>
                  window.open(`/viewer/message/epub/${media.id}`, "_blank")
                }
                className="w-full p-4 h-auto justify-start"
                data-testid={`view-epub-${media.id}`}
              >
                <Book className="h-8 w-8 text-primary mr-3" />
                <div className="text-left">
                  <h6 className="font-semibold text-primary">
                    {media.fileName || "View Online"}.epub
                  </h6>
                  <p className="text-sm text-muted-foreground">View Online</p>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Load More Button */}
      {canLoadMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            data-testid="load-more-messages"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load Previous Messages"
            )}
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex space-x-3 ${message.isOwn ? "flex-row-reverse space-x-reverse" : ""}`}
            data-message-id={message.id}
          >
            {/* Avatar (only for received messages) */}
            {!message.isOwn && (
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={message.senderAvatar} />
                <AvatarFallback>
                  {message.senderName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`flex-1 ${message.isOwn ? "text-right" : ""}`}>
              {/* Message Content */}
              <div className={`inline-block ${message.isOwn ? "ml-auto" : ""}`}>
                <MessageContent message={message} />
              </div>

              {/* Message Info */}
              <div
                className={`flex items-center space-x-2 mt-1 text-xs text-muted-foreground ${
                  message.isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* Delete button for own messages */}
                {message.isOwn &&
                  message.canDelete &&
                  settings.canDeleteMessages && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteMessage(message.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      data-testid={`delete-message-${message.id}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}

                {/* Price indicator */}
                {message.price > 0 && (
                  <div className="flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>
                      {settings.currencySymbol}
                      {message.price}
                      {message.isPaid && " (Paid)"}
                    </span>
                  </div>
                )}

                {/* Timestamp */}
                <span>
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                  })}
                </span>

                {/* Read receipt for sent messages */}
                {message.isOwn && (
                  <div className="flex items-center space-x-1">
                    {message.isPaid ? (
                      <Eye className="h-3 w-3 text-blue-500" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="text-center py-12">
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <h4 className="text-lg font-semibold mb-2">No Messages Yet</h4>
          <p className="text-muted-foreground">
            Start the conversation by sending your first message
          </p>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}

export default MessagingChat;
