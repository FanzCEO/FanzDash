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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  LogIn,
  UserPlus,
} from "lucide-react";
import { SiFacebook, SiGoogle } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (credentials: LoginData) => Promise<void>;
  onRegister: (userData: RegisterData) => Promise<void>;
  onSocialLogin: (provider: "facebook" | "google" | "twitter") => void;
  settings: {
    facebookLogin: boolean;
    googleLogin: boolean;
    twitterLogin: boolean;
    disableEmailLogin: boolean;
    registrationActive: boolean;
    captchaEnabled: boolean;
    termsLink: string;
    privacyLink: string;
  };
  isProfileAccess?: boolean;
  profileUsername?: string;
  className?: string;
}

interface LoginData {
  usernameOrEmail: string;
  password: string;
  remember: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
}

export function EnhancedLoginModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onSocialLogin,
  settings,
  isProfileAccess = false,
  profileUsername,
  className = "",
}: LoginModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    usernameOrEmail: "",
    password: "",
    remember: false,
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const hasSocialLogin =
    settings.facebookLogin || settings.googleLogin || settings.twitterLogin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      if (isLoginMode) {
        if (!loginData.usernameOrEmail || !loginData.password) {
          setError("Please fill in all required fields");
          return;
        }
        await onLogin(loginData);
        onClose();
      } else {
        if (
          !registerData.name ||
          !registerData.email ||
          !registerData.password
        ) {
          setError("Please fill in all required fields");
          return;
        }
        if (!registerData.agreeToTerms) {
          setError("Please agree to the terms and conditions");
          return;
        }
        await onRegister(registerData);
        setSuccess(
          "Account created successfully! Please check your email for verification.",
        );
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
    setSuccess(null);
  };

  const resetForm = () => {
    setLoginData({ usernameOrEmail: "", password: "", remember: false });
    setRegisterData({ name: "", email: "", password: "", agreeToTerms: false });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isProfileAccess
              ? "Login to Continue"
              : isLoginMode
                ? "Welcome Back"
                : "Create Account"}
            {profileUsername && (
              <p className="text-sm font-normal text-muted-foreground mt-1">
                Access @{profileUsername}'s profile
              </p>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Social Login Buttons */}
          {hasSocialLogin && (
            <>
              <div className="space-y-2">
                {settings.facebookLogin && (
                  <Button
                    variant="outline"
                    onClick={() => onSocialLogin("facebook")}
                    className="w-full"
                    data-testid="facebook-login-btn"
                  >
                    <SiFacebook className="h-4 w-4 mr-2 text-blue-600" />
                    {isLoginMode ? "Login" : "Sign up"} with Facebook
                  </Button>
                )}

                {settings.twitterLogin && (
                  <Button
                    variant="outline"
                    onClick={() => onSocialLogin("twitter")}
                    className="w-full"
                    data-testid="twitter-login-btn"
                  >
                    <FaXTwitter className="h-4 w-4 mr-2" />
                    {isLoginMode ? "Login" : "Sign up"} with X
                  </Button>
                )}

                {settings.googleLogin && (
                  <Button
                    variant="outline"
                    onClick={() => onSocialLogin("google")}
                    className="w-full"
                    data-testid="google-login-btn"
                  >
                    <SiGoogle className="h-4 w-4 mr-2" />
                    {isLoginMode ? "Login" : "Sign up"} with Google
                  </Button>
                )}
              </div>

              {!settings.disableEmailLogin && (
                <div className="relative">
                  <Separator />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground uppercase">
                      OR
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email/Password Form */}
          {!settings.disableEmailLogin && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Fields */}
              {!isLoginMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="pl-10"
                        placeholder="Enter your full name"
                        data-testid="register-name-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) =>
                          setRegisterData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        className="pl-10"
                        placeholder="Enter your email address"
                        data-testid="register-email-input"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Login Fields */}
              {isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="username-email">Username or Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username-email"
                      type="text"
                      value={loginData.usernameOrEmail}
                      onChange={(e) =>
                        setLoginData((prev) => ({
                          ...prev,
                          usernameOrEmail: e.target.value,
                        }))
                      }
                      className="pl-10"
                      placeholder="Enter username or email"
                      data-testid="login-username-input"
                    />
                  </div>
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={
                      isLoginMode ? loginData.password : registerData.password
                    }
                    onChange={(e) => {
                      if (isLoginMode) {
                        setLoginData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                      } else {
                        setRegisterData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }));
                      }
                    }}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    data-testid="password-input"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    data-testid="toggle-password-btn"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {isLoginMode && (
                  <div className="text-right">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        handleClose();
                        // Navigate to password reset
                      }}
                      className="p-0 h-auto text-xs"
                      data-testid="forgot-password-btn"
                    >
                      Forgot Password?
                    </Button>
                  </div>
                )}
              </div>

              {/* Remember Me / Terms */}
              <div className="space-y-3">
                {isLoginMode ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={loginData.remember}
                      onCheckedChange={(checked) =>
                        setLoginData((prev) => ({
                          ...prev,
                          remember: checked as boolean,
                        }))
                      }
                      data-testid="remember-checkbox"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agree-terms"
                      checked={registerData.agreeToTerms}
                      onCheckedChange={(checked) =>
                        setRegisterData((prev) => ({
                          ...prev,
                          agreeToTerms: checked as boolean,
                        }))
                      }
                      data-testid="terms-checkbox"
                    />
                    <Label htmlFor="agree-terms" className="text-sm leading-5">
                      I agree to the{" "}
                      <a
                        href={settings.termsLink}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Terms & Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href={settings.privacyLink}
                        target="_blank"
                        className="text-primary hover:underline"
                      >
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-testid="submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isLoginMode ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    {isLoginMode ? (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Login
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </>
                    )}
                  </>
                )}
              </Button>

              {/* Cancel Button */}
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="w-full"
                disabled={isSubmitting}
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
            </form>
          )}

          {/* Toggle Login/Register */}
          {settings.registrationActive && (
            <div className="text-center">
              <Button
                variant="link"
                onClick={toggleMode}
                className="text-sm"
                data-testid="toggle-mode-btn"
              >
                <strong>
                  {isLoginMode
                    ? "Don't have an account?"
                    : "Already have an account?"}
                </strong>
              </Button>
            </div>
          )}

          {/* CAPTCHA Notice */}
          {settings.captchaEnabled && (
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                This site is protected by reCAPTCHA.{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Privacy
                </a>{" "}
                •{" "}
                <a
                  href="https://policies.google.com/terms"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Terms
                </a>
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedLoginModal;
