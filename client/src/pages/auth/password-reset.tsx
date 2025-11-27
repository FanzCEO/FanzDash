import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Mail,
  Send,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();

  const resetMutation = useMutation({
    mutationFn: (email: string) =>
      apiRequest("/api/auth/password/email", "POST", { email }),
    onSuccess: () => {
      setSuccessMessage(
        "Password reset link has been sent to your email address.",
      );
      toast({ title: "Reset link sent" });
      setEmail("");
    },
    onError: (error: any) => {
      setErrors(
        error.response?.data?.errors || {
          general: "Failed to send reset link",
        },
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!email) {
      setErrors({ email: "Email address is required" });
      return;
    }

    resetMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-border bg-white shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Password Recovery
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alerts */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    required
                    data-testid="input-email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={resetMutation.isPending}
                data-testid="button-send-reset"
              >
                <Send className="mr-2 h-4 w-4" />
                {resetMutation.isPending ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            {/* reCAPTCHA Notice */}
            <p className="text-xs text-center text-muted-foreground">
              This site is protected by reCAPTCHA and the Google{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                className="underline"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                className="underline"
              >
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="mt-4 flex justify-center space-x-4">
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-200"
              data-testid="link-login"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
