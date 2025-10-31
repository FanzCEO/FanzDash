import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Zap,
  Eye,
  DollarSign,
  AlertTriangle,
  Clock,
  Users,
  Lock,
  Unlock,
  Loader2,
  Info,
} from "lucide-react";

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStream: (streamData: LiveStreamData) => Promise<void>;
  settings: {
    liveStreamingFree: boolean;
    limitLiveStreamingPaid: number;
    limitLiveStreamingFree: number;
    liveStreamingMinimumPrice: number;
    currencySymbol: string;
    serverTimezone: string;
  };
  className?: string;
}

interface LiveStreamData {
  name: string;
  availability: "all_pay" | "free_paid_subscribers" | "everyone_free";
  price: number;
}

const availabilityOptions = [
  {
    value: "all_pay",
    label: "Everyone (Paid)",
    description: "Available to everyone who pays the entry fee",
    icon: DollarSign,
  },
  {
    value: "free_paid_subscribers",
    label: "Free & Paid Subscribers",
    description: "Available to your subscribers only",
    icon: Users,
  },
  {
    value: "everyone_free",
    label: "Everyone (Free)",
    description: "Free for everyone to join",
    icon: Unlock,
  },
];

export function LiveStreamModal({
  isOpen,
  onClose,
  onCreateStream,
  settings,
  className = "",
}: LiveStreamModalProps) {
  const [streamData, setStreamData] = useState<LiveStreamData>({
    name: "",
    availability: "all_pay",
    price: settings.liveStreamingMinimumPrice,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedOption = availabilityOptions.find(
    (opt) => opt.value === streamData.availability,
  );
  const showPriceInput = streamData.availability !== "everyone_free";
  const showFreeLimit =
    streamData.availability === "everyone_free" &&
    settings.limitLiveStreamingFree > 0;
  const showPaidLimit =
    streamData.availability !== "everyone_free" &&
    settings.limitLiveStreamingPaid > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!streamData.name.trim()) {
      setError("Please enter a stream name");
      return;
    }

    if (
      showPriceInput &&
      streamData.price < settings.liveStreamingMinimumPrice
    ) {
      setError(
        `Minimum price is ${settings.currencySymbol}${settings.liveStreamingMinimumPrice}`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateStream({
        ...streamData,
        price:
          streamData.availability === "everyone_free" ? 0 : streamData.price,
      });

      // Reset form
      setStreamData({
        name: "",
        availability: "all_pay",
        price: settings.liveStreamingMinimumPrice,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create live stream");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setStreamData({
      name: "",
      availability: "all_pay",
      price: settings.liveStreamingMinimumPrice,
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Radio className="h-5 w-5 text-red-500" />
            <span>Create Live Stream</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Stream Name */}
          <div className="space-y-2">
            <Label htmlFor="stream-name">Stream Name *</Label>
            <div className="relative">
              <Zap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="stream-name"
                type="text"
                value={streamData.name}
                onChange={(e) =>
                  setStreamData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="pl-10"
                placeholder="Enter stream title"
                maxLength={100}
                data-testid="stream-name-input"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <div className="relative">
              <Eye className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <Select
                value={streamData.availability}
                onValueChange={(value: LiveStreamData["availability"]) =>
                  setStreamData((prev) => ({ ...prev, availability: value }))
                }
              >
                <SelectTrigger
                  className="pl-10"
                  data-testid="availability-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2"
                    >
                      <div className="flex items-center space-x-2">
                        <option.icon className="h-4 w-4" />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}

                  {!settings.liveStreamingFree && (
                    <SelectItem value="everyone_free" disabled>
                      <div className="flex items-center space-x-2 opacity-50">
                        <Unlock className="h-4 w-4" />
                        <span>Everyone (Free) - Disabled</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedOption && (
              <p className="text-sm text-muted-foreground">
                {selectedOption.description}
              </p>
            )}
          </div>

          {/* Pricing */}
          {showPriceInput && (
            <div className="space-y-2">
              <Label htmlFor="stream-price">
                Price (Minimum: {settings.currencySymbol}
                {settings.liveStreamingMinimumPrice})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                  {settings.currencySymbol}
                </span>
                <Input
                  id="stream-price"
                  type="number"
                  min={settings.liveStreamingMinimumPrice}
                  step="0.01"
                  value={streamData.price}
                  onChange={(e) =>
                    setStreamData((prev) => ({
                      ...prev,
                      price: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="pl-8"
                  placeholder={settings.liveStreamingMinimumPrice.toString()}
                  data-testid="stream-price-input"
                />
              </div>
            </div>
          )}

          {/* Time Limits */}
          {showPaidLimit && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Time Limit:</strong> {settings.limitLiveStreamingPaid}{" "}
                minutes maximum per paid transmission
              </AlertDescription>
            </Alert>
          )}

          {showFreeLimit && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Time Limit:</strong> {settings.limitLiveStreamingFree}{" "}
                minutes maximum per free transmission
              </AlertDescription>
            </Alert>
          )}

          {/* Server Timezone Info */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Server timezone:
              <a
                href={`https://www.google.com/search?q=time+${settings.serverTimezone.replace("_", "+")}`}
                target="_blank"
                className="text-primary hover:underline ml-1"
              >
                {settings.serverTimezone.replace("_", " ")}
                <Info className="h-3 w-3 inline ml-1" />
              </a>
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={resetAndClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="cancel-stream-btn"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              disabled={isSubmitting || !streamData.name.trim()}
              data-testid="create-stream-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Radio className="h-4 w-4 mr-2" />
                  Go Live
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default LiveStreamModal;
