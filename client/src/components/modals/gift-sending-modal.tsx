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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Gift,
  DollarSign,
  MessageCircle,
  AlertTriangle,
  Loader2,
  Heart,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";

interface Gift {
  id: string;
  name: string;
  image: string;
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface TaxRate {
  id: string;
  name: string;
  percentage: number;
}

interface GiftSendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendGift: (giftId: string, message?: string) => Promise<void>;
  recipientName: string;
  recipientAvatar?: string;
  gifts: Gift[];
  taxRates?: TaxRate[];
  isMessage?: boolean;
  isLiveStream?: boolean;
  userWalletBalance: number;
  currencySymbol: string;
  className?: string;
}

export function GiftSendingModal({
  isOpen,
  onClose,
  onSendGift,
  recipientName,
  recipientAvatar,
  gifts,
  taxRates = [],
  isMessage = false,
  isLiveStream = false,
  userWalletBalance,
  currencySymbol,
  className = "",
}: GiftSendingModalProps) {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedGiftData = gifts.find((g) => g.id === selectedGift);
  const totalTaxes = taxRates.reduce(
    (sum, tax) =>
      sum +
      (selectedGiftData ? (selectedGiftData.price * tax.percentage) / 100 : 0),
    0,
  );
  const totalPrice = selectedGiftData ? selectedGiftData.price + totalTaxes : 0;

  const getRarityIcon = (rarity: Gift["rarity"]) => {
    switch (rarity) {
      case "common":
        return <Gift className="h-4 w-4 text-gray-500" />;
      case "rare":
        return <Heart className="h-4 w-4 text-blue-500" />;
      case "epic":
        return <Star className="h-4 w-4 text-purple-500" />;
      case "legendary":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getRarityBorder = (rarity: Gift["rarity"]) => {
    switch (rarity) {
      case "common":
        return "border-gray-200";
      case "rare":
        return "border-blue-200 bg-blue-50";
      case "epic":
        return "border-purple-200 bg-purple-50";
      case "legendary":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-gray-200";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGift) {
      setError("Please select a gift to send");
      return;
    }

    if (totalPrice > userWalletBalance) {
      setError("Insufficient wallet balance");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSendGift(selectedGift, message.trim() || undefined);
      onClose();
      // Reset form
      setSelectedGift(null);
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to send gift. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5 text-primary" />
            <span>Send a Gift</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Send a special gift to {recipientName}
            {isMessage && " with your message"}
            {isLiveStream && " during live stream"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gift Selection */}
          <div className="space-y-3">
            <Label>Choose a Gift</Label>
            <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
              {gifts.map((gift) => (
                <Card
                  key={gift.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedGift === gift.id
                      ? "ring-2 ring-primary border-primary"
                      : getRarityBorder(gift.rarity),
                  )}
                  onClick={() => setSelectedGift(gift.id)}
                  data-testid={`gift-${gift.id}`}
                >
                  <CardContent className="p-3 text-center">
                    <div className="relative mb-2">
                      <img
                        src={gift.image}
                        alt={gift.name}
                        className="w-16 h-16 mx-auto object-contain"
                      />
                      <div className="absolute -top-1 -right-1">
                        {getRarityIcon(gift.rarity)}
                      </div>
                    </div>

                    <h6 className="text-xs font-medium mb-1 truncate">
                      {gift.name}
                    </h6>

                    <div className="flex items-center justify-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-sm font-semibold">
                        {gift.price.toFixed(2)}
                      </span>
                    </div>

                    {gift.rarity !== "common" && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {gift.rarity}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Message Input */}
          {(isMessage || isLiveStream) && (
            <div className="space-y-2">
              <Label htmlFor="gift-message">
                Message {isMessage ? "(Optional)" : "(Optional)"}
              </Label>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="gift-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="pl-10 min-h-[60px]"
                  placeholder="Write a short message..."
                  maxLength={50}
                  data-testid="gift-message-input"
                />
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  {50 - message.length} characters remaining
                </span>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {selectedGiftData && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gift Price:</span>
                    <span className="font-semibold">
                      {currencySymbol}
                      {selectedGiftData.price.toFixed(2)}
                    </span>
                  </div>

                  {taxRates.map((tax) => (
                    <div
                      key={tax.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <span>
                        {tax.name} ({tax.percentage}%):
                      </span>
                      <span>
                        {currencySymbol}
                        {(
                          (selectedGiftData.price * tax.percentage) /
                          100
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {taxRates.length > 0 && (
                    <div className="border-t pt-2 flex justify-between items-center font-semibold">
                      <span>Total:</span>
                      <span>
                        {currencySymbol}
                        {totalPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Wallet Balance */}
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Available Balance:{" "}
              <span className="font-semibold text-foreground">
                {currencySymbol}
                {userWalletBalance.toFixed(2)}
              </span>
            </p>
            {userWalletBalance < totalPrice && selectedGiftData && (
              <p className="text-xs text-red-600 mt-1">
                Insufficient balance. Please recharge your wallet.
              </p>
            )}
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
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="cancel-gift-btn"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={
                !selectedGift || isSubmitting || totalPrice > userWalletBalance
              }
              data-testid="send-gift-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Send Gift
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default GiftSendingModal;
