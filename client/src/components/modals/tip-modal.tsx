import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DollarSign,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Wallet,
  Info,
  RefreshCw,
  AlertTriangle,
  Gift,
} from "lucide-react";
import { SiPaypal, SiStripe } from "react-icons/si";

interface PaymentMethod {
  id: string;
  name: string;
  type: "card" | "paypal" | "wallet" | "other";
  logo?: string;
  description?: string;
}

interface TaxRate {
  id: string;
  name: string;
  percentage: number;
}

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendTip: (data: TipData) => Promise<void>;
  recipient: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
    coverImage?: string;
  };
  paymentMethods: PaymentMethod[];
  taxRates: TaxRate[];
  walletBalance: number;
  tipSettings: {
    minAmount: number;
    maxAmount: number;
    currencyCode: string;
    currencySymbol: string;
    walletEnabled: boolean;
  };
  isMessage?: boolean;
  isLiveStream?: boolean;
  liveId?: string;
  showBillingInfo?: {
    company?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  className?: string;
}

interface TipData {
  amount: number;
  paymentMethod: string;
  isMessage?: boolean;
  isLiveStream?: boolean;
  liveId?: string;
}

export function TipModal({
  isOpen,
  onClose,
  onSendTip,
  recipient,
  paymentMethods,
  taxRates,
  walletBalance,
  tipSettings,
  isMessage = false,
  isLiveStream = false,
  liveId,
  showBillingInfo,
  className = "",
}: TipModalProps) {
  const [amount, setAmount] = useState(tipSettings.minAmount);
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = amount;
  const taxes = taxRates.map((tax) => ({
    ...tax,
    amount: (subtotal * tax.percentage) / 100,
  }));
  const totalTaxes = taxes.reduce((sum, tax) => sum + tax.amount, 0);
  const total = subtotal + totalTaxes;

  const adjustAmount = (increment: number) => {
    const newAmount = Math.max(
      tipSettings.minAmount,
      Math.min(tipSettings.maxAmount, amount + increment),
    );
    setAmount(newAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayment) {
      setError("Please select a payment method");
      return;
    }

    if (amount < tipSettings.minAmount || amount > tipSettings.maxAmount) {
      setError(
        `Tip amount must be between ${tipSettings.currencySymbol}${tipSettings.minAmount} and ${tipSettings.currencySymbol}${tipSettings.maxAmount}`,
      );
      return;
    }

    if (selectedPayment === "wallet" && total > walletBalance) {
      setError("Insufficient wallet balance");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSendTip({
        amount: total,
        paymentMethod: selectedPayment,
        isMessage,
        isLiveStream,
        liveId,
      });

      // Reset form and close
      setAmount(tipSettings.minAmount);
      setSelectedPayment("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send tip. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentIcon = (payment: PaymentMethod) => {
    switch (payment.type) {
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "wallet":
        return <Wallet className="h-4 w-4" />;
      default:
        if (payment.name.toLowerCase().includes("paypal")) {
          return <SiPaypal className="h-4 w-4" />;
        }
        if (payment.name.toLowerCase().includes("stripe")) {
          return <SiStripe className="h-4 w-4" />;
        }
        return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {/* Header with cover/avatar */}
        <div
          className="relative h-24 bg-gradient-to-r from-primary to-primary/80 rounded-t-lg -mx-6 -mt-6"
          style={{
            background: recipient.coverImage
              ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${recipient.coverImage})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
              <AvatarImage src={recipient.avatar} />
              <AvatarFallback className="text-lg">
                {recipient.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="pt-12 space-y-4">
          <div className="text-center">
            <h6 className="font-semibold">Send Tip to {recipient.name}</h6>
            <p className="text-sm text-muted-foreground">
              * In {tipSettings.currencyCode}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="tip-amount">
                Tip Amount (Min: {tipSettings.currencySymbol}
                {tipSettings.minAmount})
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm">
                  {tipSettings.currencySymbol}
                </span>
                <Input
                  id="tip-amount"
                  type="number"
                  min={tipSettings.minAmount}
                  max={tipSettings.maxAmount}
                  step="0.01"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      parseFloat(e.target.value) || tipSettings.minAmount,
                    )
                  }
                  className="pl-8 text-center font-semibold"
                  data-testid="tip-amount-input"
                />
              </div>

              {/* Amount Controls */}
              <div className="flex justify-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(-1)}
                  disabled={amount <= tipSettings.minAmount}
                  data-testid="decrease-amount-btn"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustAmount(1)}
                  disabled={amount >= tipSettings.maxAmount}
                  data-testid="increase-amount-btn"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                <ArrowUp className="h-3 w-3 inline mr-1" />
                <ArrowDown className="h-3 w-3 inline mr-1" />
                Use buttons to adjust amount
              </p>
            </div>

            {/* Payment Methods */}
            {!isLiveStream && paymentMethods.length > 0 && (
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup
                  value={selectedPayment}
                  onValueChange={setSelectedPayment}
                  className="space-y-2"
                >
                  {paymentMethods.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem
                        value={payment.name}
                        id={payment.id}
                        disabled={
                          payment.type === "wallet" && walletBalance === 0
                        }
                        data-testid={`payment-${payment.name.toLowerCase()}`}
                      />
                      <Label
                        htmlFor={payment.id}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center space-x-2">
                          {getPaymentIcon(payment)}
                          <div>
                            <div className="font-semibold">
                              {payment.type === "card"
                                ? "Debit/Credit Card"
                                : payment.name}
                            </div>
                            {payment.description && (
                              <div className="text-xs text-muted-foreground">
                                {payment.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Wallet Balance */}
            {tipSettings.walletEnabled && walletBalance > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Wallet</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      Available: {tipSettings.currencySymbol}
                      {walletBalance.toFixed(2)}
                    </div>
                    {walletBalance === 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto text-xs"
                      >
                        Recharge
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tax Breakdown */}
            {taxRates.length > 0 && amount > 0 && (
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Subtotal:</span>
                      <span className="font-semibold">
                        {tipSettings.currencySymbol}
                        {subtotal.toFixed(2)}
                      </span>
                    </div>

                    {taxes.map((tax) => (
                      <div
                        key={tax.id}
                        className="flex justify-between items-center text-sm"
                      >
                        <span>
                          {tax.name} {tax.percentage}%:
                        </span>
                        <span>
                          {tipSettings.currencySymbol}
                          {tax.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}

                    <div className="border-t pt-2 flex justify-between items-center font-semibold">
                      <span>Total:</span>
                      <span>
                        {tipSettings.currencySymbol}
                        {total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Billing Info */}
            {showBillingInfo && (
              <div className="text-center space-y-1">
                {showBillingInfo.company && (
                  <p className="text-xs text-muted-foreground">
                    Company: {showBillingInfo.company}
                  </p>
                )}
                {showBillingInfo.address && (
                  <p className="text-xs text-muted-foreground">
                    Address: {showBillingInfo.address} {showBillingInfo.city}{" "}
                    {showBillingInfo.country}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
                data-testid="cancel-tip-btn"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isSubmitting || !selectedPayment || total > walletBalance
                }
                data-testid="send-tip-btn"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TipModal;
