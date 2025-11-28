import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Smartphone,
  Key,
  Mail,
  User,
  Chrome,
  Github,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function MultiAuthLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [verificationStep, setVerificationStep] = useState<
    "none" | "device" | "mfa"
  >("none");
  const [tempToken, setTempToken] = useState("");
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    identifier: "",
    password: "",
  });

  // Registration form state
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
  });

  // MFA state
  const [mfaCode, setMfaCode] = useState("");
  const [deviceVerificationCode, setDeviceVerificationCode] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/login", "POST", loginData);

      if (response.requiresVerification) {
        setVerificationStep("device");
        toast({
          title: "Device Verification Required",
          description: "Please check your email for a verification code.",
          variant: "default",
        });
      } else if (response.requiresMFA) {
        setVerificationStep("mfa");
        setTempToken(response.tempToken);
        toast({
          title: "Two-Factor Authentication",
          description: "Please enter your authenticator code.",
          variant: "default",
        });
      } else if (response.success) {
        localStorage.setItem("authToken", response.token);
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Login Failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/register", "POST", {
        email: registerData.email,
        password: registerData.password,
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        username: registerData.username,
      });

      if (response.success) {
        localStorage.setItem("authToken", response.token);
        toast({
          title: "Registration Successful",
          description: "Welcome to FanzDash!",
          variant: "default",
        });
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Registration Failed",
          description: response.error || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.message || "Failed to register",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/verify-device", "POST", {
        token: deviceVerificationCode,
      });

      if (response.success) {
        localStorage.setItem("authToken", response.token);
        toast({
          title: "Device Verified",
          description: "Login successful!",
          variant: "default",
        });
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Verification Failed",
          description: response.error || "Invalid verification code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify device",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("/auth/verify-mfa", "POST", {
        token: mfaCode,
        tempToken,
      });

      if (response.success) {
        localStorage.setItem("authToken", response.token);
        toast({
          title: "Authentication Successful",
          description: "Welcome back!",
          variant: "default",
        });
        window.location.href = "/dashboard";
      } else {
        toast({
          title: "Verification Failed",
          description: response.error || "Invalid authentication code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider: string) => {
    window.location.href = `/auth/${provider}`;
  };

  if (verificationStep === "device") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-white">Device Verification</CardTitle>
            <CardDescription className="text-gray-300">
              Enter the verification code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDeviceVerification} className="space-y-4">
              <div>
                <Label htmlFor="verificationCode" className="text-white">
                  Verification Code
                </Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={deviceVerificationCode}
                  onChange={(e) => setDeviceVerificationCode(e.target.value)}
                  placeholder="Enter verification code"
                  className="bg-gray-800/50 border-gray-600 text-white"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Device"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStep === "mfa") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border-gray-800">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-white">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-gray-300">
              Enter the code from your authenticator app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleMFAVerification} className="space-y-4">
              <div>
                <Label htmlFor="mfaCode" className="text-white">
                  Authentication Code
                </Label>
                <Input
                  id="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="bg-gray-800/50 border-gray-600 text-white"
                  maxLength={6}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-black/20 backdrop-blur-xl border-gray-800">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white mb-2">
            FanzDash Authentication
          </CardTitle>
          <CardDescription className="text-gray-300">
            Enterprise-grade multi-method authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* OAuth Buttons */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("google")}
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Chrome className="w-4 h-4 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("github")}
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("facebook")}
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                  size="sm"
                >
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("twitter")}
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                  size="sm"
                >
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleOAuthLogin("linkedin")}
                  className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700"
                  size="sm"
                >
                  <Linkedin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <Separator className="bg-gray-600" />
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/20 px-2 text-gray-400 text-sm">
                or continue with
              </span>
            </div>

            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="identifier" className="text-white">
                    Email, Username, or FanzID
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    value={loginData.identifier}
                    onChange={(e) =>
                      setLoginData({ ...loginData, identifier: e.target.value })
                    }
                    placeholder="Enter email, username, or FanzID"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={registerData.firstName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="John"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={registerData.lastName}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          lastName: e.target.value,
                        })
                      }
                      placeholder="Doe"
                      className="bg-gray-800/50 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username" className="text-white">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        username: e.target.value,
                      })
                    }
                    placeholder="johndoe"
                    className="bg-gray-800/50 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    placeholder="john@example.com"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Create a strong password"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm your password"
                    className="bg-gray-800/50 border-gray-600 text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-400">
            <p>Secure authentication powered by military-grade encryption</p>
            <p className="mt-1">© 2025 Fanz™ Unlimited Network LLC</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
