import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Image as ImageIcon,
  Video,
  Music,
  FileArchive,
  DollarSign,
  Lock,
  Unlock,
  Calendar,
  Type,
  Smile,
  MoreHorizontal,
  X,
  Upload,
  Play,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface MediaFile {
  id: string;
  file: File;
  type: "image" | "video" | "audio" | "zip" | "epub";
  preview?: string;
  progress?: number;
}

interface PostCreationFormProps {
  currentUser: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    isVerified: boolean;
    postLocked: boolean;
    freeSubscription: boolean;
  };
  settings: {
    updateLength: number;
    currencySymbol: string;
    maxFiles: number;
    allowZipFiles: boolean;
    allowEpubFiles: boolean;
    allowReels: boolean;
    allowScheduled: boolean;
    allowPPV: boolean;
    disableFreePost: boolean;
    liveStreamingStatus: boolean;
    disableAudio: boolean;
  };
  onSubmit: (data: PostData) => Promise<void>;
  className?: string;
}

interface PostData {
  description: string;
  media: MediaFile[];
  price?: number;
  title?: string;
  isLocked: boolean;
  scheduledDate?: Date;
  type: "post" | "reel" | "live";
}

export function PostCreationForm({
  currentUser,
  settings,
  onSubmit,
  className = "",
}: PostCreationFormProps) {
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [price, setPrice] = useState<number | undefined>();
  const [title, setTitle] = useState("");
  const [isLocked, setIsLocked] = useState(currentUser.postLocked);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [showPrice, setShowPrice] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipFileInputRef = useRef<HTMLInputElement>(null);
  const epubFileInputRef = useRef<HTMLInputElement>(null);

  // Mock emoji data
  const emojis = [
    "😀",
    "😂",
    "😍",
    "👍",
    "❤️",
    "😢",
    "😮",
    "😡",
    "🔥",
    "💯",
    "🎉",
    "👏",
    "🙌",
    "💪",
    "🤔",
    "😎",
  ];

  const charactersRemaining = settings.updateLength - description.length;
  const canSubmit =
    (description.trim().length > 0 || media.length > 0) && !isSubmitting;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (media.length + files.length > settings.maxFiles) {
      setErrors([`Maximum ${settings.maxFiles} files allowed`]);
      return;
    }

    const newMedia = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: getFileType(file),
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
    }));

    setMedia((prev) => [...prev, ...newMedia]);
    simulateUpload(newMedia);
  };

  const getFileType = (file: File): MediaFile["type"] => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/zip") return "zip";
    if (file.type === "application/epub+zip") return "epub";
    return "image";
  };

  const simulateUpload = (files: MediaFile[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => prev.filter((item) => item.id !== id));
  };

  const insertEmoji = (emoji: string) => {
    setDescription((prev) => prev + emoji);
    setShowEmojis(false);
  };

  const handleSubmit = async () => {
    setErrors([]);
    setIsSubmitting(true);

    try {
      if (!description.trim() && media.length === 0) {
        setErrors(["Please add some content to your post"]);
        return;
      }

      if (description.length > settings.updateLength) {
        setErrors([
          `Post is too long. Maximum ${settings.updateLength} characters allowed.`,
        ]);
        return;
      }

      const postData: PostData = {
        description: description.trim(),
        media,
        price: showPrice ? price : undefined,
        title: showTitle ? title.trim() : undefined,
        isLocked,
        scheduledDate,
        type: "post",
      };

      await onSubmit(postData);

      // Reset form
      setDescription("");
      setMedia([]);
      setPrice(undefined);
      setTitle("");
      setShowPrice(false);
      setShowTitle(false);
      setScheduledDate(undefined);
    } catch (error) {
      setErrors(["Failed to create post. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={className}>
      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Uploading files...</span>
            <span className="text-sm text-muted-foreground">
              {uploadProgress}%
            </span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Scheduled Post Alert */}
      {scheduledDate && (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>Scheduled:</strong> {scheduledDate.toLocaleString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScheduledDate(undefined)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="cyber-border">
        <CardContent className="p-4">
          {/* User Info */}
          <div className="flex space-x-3 mb-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>
                {currentUser.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] border-0 resize-none focus:ring-0 text-lg"
                placeholder="What's on your mind?"
                maxLength={settings.updateLength}
              />
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Price Input */}
          {showPrice && (
            <div className="mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {settings.currencySymbol}
                </span>
                <Input
                  type="number"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Set price"
                  className="w-32"
                  min="0"
                  step="0.01"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPrice(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Title Input */}
          {showTitle && (
            <div className="mb-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title (optional)"
                maxLength={100}
                className="mb-2"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Titles help organize your content and make it easier to find
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTitle(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Media Preview */}
          {media.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {item.type === "image" && item.preview ? (
                        <img
                          src={item.preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : item.type === "video" ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Play className="h-8 w-8 text-gray-500" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          {item.type === "audio" && (
                            <Music className="h-8 w-8 text-gray-500" />
                          )}
                          {item.type === "zip" && (
                            <FileArchive className="h-8 w-8 text-gray-500" />
                          )}
                          {item.type === "epub" && (
                            <FileArchive className="h-8 w-8 text-gray-500" />
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emoji Picker */}
          {showEmojis && (
            <div className="mb-4 bg-white border rounded-lg p-3 shadow-lg">
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Media Upload */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8"
                disabled={media.length >= settings.maxFiles}
              >
                <ImageIcon className="h-4 w-4" />
              </Button>

              {/* PPV Price */}
              {settings.allowPPV &&
                (currentUser.freeSubscription || !settings.allowPPV) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrice(!showPrice)}
                    className={`h-8 ${showPrice ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <DollarSign className="h-4 w-4" />
                  </Button>
                )}

              {/* Lock/Unlock */}
              {!settings.disableFreePost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLocked(!isLocked)}
                  className={`h-8 ${isLocked ? "bg-orange-100 text-orange-600" : ""}`}
                >
                  {isLocked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </Button>
              )}

              {/* Schedule */}
              {settings.allowScheduled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setScheduledDate(tomorrow);
                  }}
                  className={`h-8 ${scheduledDate ? "bg-blue-100 text-blue-600" : ""}`}
                >
                  <Calendar className="h-4 w-4" />
                </Button>
              )}

              {/* Title */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTitle(!showTitle)}
                className={`h-8 ${showTitle ? "bg-gray-100" : ""}`}
              >
                <Type className="h-4 w-4" />
              </Button>

              {/* Emoji */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojis(!showEmojis)}
                className="h-8"
              >
                <Smile className="h-4 w-4" />
              </Button>

              {/* More Options */}
              {(settings.allowZipFiles || settings.allowEpubFiles) && (
                <div className="relative">
                  <Button variant="ghost" size="sm" className="h-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {/* Character Count */}
              <span
                className={`text-sm ${charactersRemaining < 0 ? "text-red-500" : "text-muted-foreground"}`}
              >
                {charactersRemaining}
              </span>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="rounded-full"
              >
                {isSubmitting ? (
                  <>Posting...</>
                ) : scheduledDate ? (
                  "Schedule"
                ) : (
                  "Publish"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={`image/*,video/mp4,video/quicktime${settings.disableAudio ? "" : ",audio/mp3"}`}
        onChange={handleFileSelect}
        className="hidden"
      />

      {settings.allowZipFiles && (
        <input
          ref={zipFileInputRef}
          type="file"
          accept="application/zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}

      {settings.allowEpubFiles && (
        <input
          ref={epubFileInputRef}
          type="file"
          accept="application/epub+zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      )}
    </div>
  );
}

export default PostCreationForm;
