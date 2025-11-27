import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, RefreshCw, AlertTriangle } from "lucide-react";

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  isProfileVerification?: boolean;
  className?: string;
}

export function TwoFactorAuthModal({
  isOpen,
  onClose,
  onVerify,
  isProfileVerification = false,
  className = "",
}: TwoFactorAuthModalProps) {
  const [codes, setCodes] = useState<string[]>(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    const sanitizedValue = value.replace(/\D/g, "").slice(0, 1);

    const newCodes = [...codes];
    newCodes[index] = sanitizedValue;
    setCodes(newCodes);

    // Auto-advance to next input
    if (sanitizedValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (!codes[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCodes = [...codes];
        newCodes[index] = "";
        setCodes(newCodes);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 4);

    const newCodes = Array(4)
      .fill("")
      .map((_, index) => digits[index] || "");
    setCodes(newCodes);

    // Focus on the next empty input or last input
    const nextEmptyIndex = newCodes.findIndex((code) => !code);
    const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async () => {
    const fullCode = codes.join("");

    if (fullCode.length !== 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onVerify(fullCode);
      // Reset form on success
      setCodes(["", "", "", ""]);
      onClose();
    } catch (err) {
      setError("Invalid verification code. Please try again.");
      // Clear codes and focus first input on error
      setCodes(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      // Simulate API call to resend code
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResendCooldown(60); // 60 second cooldown
    } catch (err) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = codes.every((code) => code.length === 1);
  const isDisabled = !isComplete || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Two-Step Authentication</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isProfileVerification
                ? "Enter the verification code to access your profile"
                : "Enter the 4-digit code sent to your device to continue"}
            </p>
          </div>

          {/* Code Input Grid */}
          <div className="flex justify-center space-x-3">
            {codes.map((code, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-primary"
                data-testid={`code-input-${index + 1}`}
              />
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resend Code */}
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isResending}
              className="text-sm"
              data-testid="resend-code-btn"
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Resend Code
                </>
              )}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
              data-testid="cancel-2fa-btn"
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isDisabled}
              className="flex-1"
              data-testid="verify-2fa-btn"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              Your account is protected by two-factor authentication
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TwoFactorAuthModal;
