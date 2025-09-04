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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { apiRequest } from "@/lib/queryClient";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  agreeGdpr: boolean;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    agreeGdpr: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterForm) =>
      apiRequest("/api/auth/register", "POST", data),
    onSuccess: (data) => {
      setSuccessMessage(
        "Account created successfully! Please check your email for verification.",
      );
      toast({ title: "Registration successful" });
      // Clear form
      setFormData({ name: "", email: "", password: "", agreeGdpr: false });
    },
    onError: (error: any) => {
      setErrors(
        error.response?.data?.errors || { general: "Registration failed" },
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");

    if (!formData.agreeGdpr) {
      setErrors({
        agreeGdpr: "You must agree to the Terms and Privacy Policy",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleInputChange = (
    field: keyof RegisterForm,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="cyber-border bg-white shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription>
              Join our platform and start your journey
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

            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/oauth/facebook")}
                data-testid="button-facebook-register"
              >
                <FaFacebook className="mr-2 h-4 w-4 text-blue-600" />
                Sign up with Facebook
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/oauth/twitter")}
                data-testid="button-twitter-register"
              >
                <FaXTwitter className="mr-2 h-4 w-4" />
                Sign up with X
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/oauth/google")}
                data-testid="button-google-register"
              >
                <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
                Sign up with Google
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                    required
                    data-testid="input-name"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    required
                    data-testid="input-email"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    required
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeGdpr"
                    checked={formData.agreeGdpr}
                    onCheckedChange={(checked) =>
                      handleInputChange("agreeGdpr", checked as boolean)
                    }
                    data-testid="checkbox-agree-gdpr"
                    className="mt-1"
                  />
                  <Label htmlFor="agreeGdpr" className="text-sm leading-5">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Terms & Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </Label>
                </div>
                {errors.agreeGdpr && (
                  <p className="text-sm text-red-500">{errors.agreeGdpr}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                {registerMutation.isPending
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="text-center">
              <Link href="/login">
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  data-testid="link-login"
                >
                  Already have an account? Sign in
                </Button>
              </Link>
            </div>

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

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-white hover:text-gray-200"
              data-testid="link-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
