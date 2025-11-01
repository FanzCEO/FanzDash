import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DeviceVerification() {
  const [, navigate] = useNavigate();
  const [location] = useLocation();
  const { toast } = useToast();

  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");

  // Extract token from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split("?")[1] || "");
    const token = urlParams.get("token");

    if (token) {
      // Auto-verify if token is in URL
      handleAutoVerification(token);
    }
  }, [location]);

  const handleAutoVerification = async (token: string) => {
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/verify-device", "POST", {
        token,
      });

      if (response.success) {
        localStorage.setItem("authToken", response.token);
        setIsVerified(true);

        toast({
          title: "Device Verified Successfully",
          description:
            "Your device has been trusted. Redirecting to dashboard...",
          variant: "default",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(response.error || "Verification failed");
        toast({
          title: "Verification Failed",
          description: response.error || "Invalid or expired token",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Verification failed");
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify device",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("/auth/verify-device", "POST", {
        token: verificationCode,
      });

      if (response.success) {
        localStorage.setItem("authToken", response.token);
        setIsVerified(true);

        toast({
          title: "Device Verified Successfully",
          description:
            "Your device has been trusted. Redirecting to dashboard...",
          variant: "default",
        });

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        setError(response.error || "Verification failed");
        toast({
          title: "Verification Failed",
          description: response.error || "Invalid verification code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setError(error.message || "Verification failed");
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify device",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl">
              Device Verified!
            </CardTitle>
            <CardDescription className="text-gray-300">
              Your device has been successfully verified and trusted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-400 mb-4">Redirecting to dashboard...</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-white">
            Device Verification Required
          </CardTitle>
          <CardDescription className="text-gray-300">
            We detected a login from a new device or location. Please verify
            this is you.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-yellow-400 font-medium">Security Notice</h4>
                <p className="text-yellow-200 text-sm mt-1">
                  If this wasn't you, please secure your account immediately by
                  changing your password.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleManualVerification} className="space-y-4">
            <div>
              <Label htmlFor="verificationCode" className="text-white">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the code from your email"
                className="bg-gray-800/50 border-gray-600 text-white"
                required
                data-testid="input-verification-code"
              />
              {error && (
                <p className="text-red-400 text-sm mt-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              data-testid="button-verify-device"
            >
              {isLoading ? "Verifying..." : "Verify Device"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate("/auth/login")}
              className="text-gray-400 hover:text-white"
              data-testid="link-back-to-login"
            >
              Back to Login
            </Button>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>This verification link expires in 15 minutes for security.</p>
            <p className="mt-1">© 2025 Fanz™ Unlimited Network LLC</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
