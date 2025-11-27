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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  ArrowRightLeft,
  Wallet,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react";

interface BalanceTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (amount: number) => Promise<void>;
  currentBalance: number;
  currencySymbol: string;
  transferFee?: number;
  minTransferAmount?: number;
  maxTransferAmount?: number;
  className?: string;
}

export function BalanceTransferModal({
  isOpen,
  onClose,
  onTransfer,
  currentBalance,
  currencySymbol,
  transferFee = 0,
  minTransferAmount = 1,
  maxTransferAmount,
  className = "",
}: BalanceTransferModalProps) {
  const [amount, setAmount] = useState(minTransferAmount);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxAllowed = maxTransferAmount || currentBalance;
  const finalAmount = amount - transferFee;
  const isValidAmount =
    amount >= minTransferAmount && amount <= maxAllowed && finalAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidAmount) {
      setError(
        `Transfer amount must be between ${currencySymbol}${minTransferAmount} and ${currencySymbol}${maxAllowed}`,
      );
      return;
    }

    if (amount > currentBalance) {
      setError("Insufficient balance");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onTransfer(amount);

      // Reset form and close
      setAmount(minTransferAmount);
      onClose();
    } catch (err: any) {
      setError(err.message || "Transfer failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setAmount(minTransferAmount);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowRightLeft className="h-5 w-5 text-primary" />
            <span>Transfer Balance</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Balance Display */}
          <Card className="bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Current Balance</span>
                </div>
                <div className="text-lg font-bold text-primary">
                  {currencySymbol}
                  {currentBalance.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">
                Transfer Amount
                {minTransferAmount > 0 && (
                  <span className="text-muted-foreground text-sm ml-1">
                    (Min: {currencySymbol}
                    {minTransferAmount})
                  </span>
                )}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  id="transfer-amount"
                  type="number"
                  min={minTransferAmount}
                  max={maxAllowed}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="pl-8 text-center font-semibold"
                  placeholder={`${minTransferAmount}`}
                  data-testid="transfer-amount-input"
                />
              </div>
            </div>

            {/* Transfer Summary */}
            {amount > 0 && (
              <Card>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transfer Amount:</span>
                      <span className="font-semibold">
                        {currencySymbol}
                        {amount.toFixed(2)}
                      </span>
                    </div>

                    {transferFee > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Transfer Fee:</span>
                        <span className="text-red-600">
                          -{currencySymbol}
                          {transferFee.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-2 flex justify-between items-center font-semibold">
                      <span>You'll Receive:</span>
                      <span className="text-green-600">
                        {currencySymbol}
                        {finalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Remaining Balance:</span>
                      <span>
                        {currencySymbol}
                        {(currentBalance - amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transfer Fee Notice */}
            {transferFee > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  A transfer fee of {currencySymbol}
                  {transferFee.toFixed(2)} will be deducted from your transfer
                  amount.
                </AlertDescription>
              </Alert>
            )}

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
                data-testid="cancel-transfer-btn"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                className="flex-1"
                disabled={
                  !isValidAmount || isSubmitting || amount > currentBalance
                }
                data-testid="confirm-transfer-btn"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    Transfer
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

export default BalanceTransferModal;
