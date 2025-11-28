import { useState } from "react";
import { SEOHeadTags, SEOBreadcrumbs } from "@/components/SEOHeadTags";
import {
  adminPageSEO,
  generatePageTitle,
  generateAdminBreadcrumbs,
} from "@/lib/seo-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  DollarSign,
  Zap,
  Globe,
  Wallet,
  Bitcoin,
  Smartphone,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff,
  TestTube,
  Key,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PaymentGateway {
  id: string;
  name: string;
  displayName: string;
  description: string;
  logo: string;
  category: "card" | "digital_wallet" | "crypto" | "bank" | "mobile";
  isEnabled: boolean;
  isTestMode: boolean;
  processingFee: number;
  minAmount: number;
  maxAmount: number;
  supportedCurrencies: string[];
  config: Record<string, any>;
  status: "active" | "inactive" | "pending" | "error";
  lastTested: string;
  totalTransactions: number;
  totalVolume: number;
}

export default function PaymentGatewaySetup() {
  const seoData = adminPageSEO.paymentGatewaySetup;
  const breadcrumbs = generateAdminBreadcrumbs("payment-gateway-setup");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingGateway, setIsTestingGateway] = useState<string | null>(null);
  const { toast } = useToast();

  const [gateways, setGateways] = useState<PaymentGateway[]>([
    {
      id: "ccbill",
      name: "ccbill",
      displayName: "CCBill",
      description: "Industry-leading adult content billing solution",
      logo: "/assets/gateways/ccbill.svg",
      category: "card",
      isEnabled: true,
      isTestMode: true,
      processingFee: 6.9,
      minAmount: 2.95,
      maxAmount: 999999.99,
      supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
      config: {
        merchantId: "951234",
        subAccountId: "0000",
        salt: "ccbill_salt_here",
        webhookUrl: "https://api.fanzdash.com/webhooks/ccbill",
      },
      status: "active",
      lastTested: "2025-01-15T10:30:00Z",
      totalTransactions: 1245,
      totalVolume: 89750.5,
    },
    {
      id: "segpay",
      name: "segpay",
      displayName: "SegPay",
      description: "Secure payment processing for adult entertainment",
      logo: "/assets/gateways/segpay.svg",
      category: "card",
      isEnabled: true,
      isTestMode: false,
      processingFee: 7.5,
      minAmount: 1.0,
      maxAmount: 10000.0,
      supportedCurrencies: ["USD", "EUR", "GBP", "CAD"],
      config: {
        packageId: "987654",
        merchantId: "12345",
        accessKey: "segpay_access_key",
        webhookUrl: "https://api.fanzdash.com/webhooks/segpay",
      },
      status: "active",
      lastTested: "2025-01-15T09:15:00Z",
      totalTransactions: 892,
      totalVolume: 43210.75,
    },
    {
      id: "coinbase",
      name: "coinbase",
      displayName: "Coinbase Commerce",
      description: "Accept Bitcoin, Ethereum, and other cryptocurrencies",
      logo: "/assets/gateways/coinbase.svg",
      category: "crypto",
      isEnabled: false,
      isTestMode: true,
      processingFee: 1.0,
      minAmount: 5.0,
      maxAmount: 50000.0,
      supportedCurrencies: ["BTC", "ETH", "LTC", "BCH", "USDC"],
      config: {
        apiKey: "",
        webhookSecret: "",
        webhookUrl: "https://api.fanzdash.com/webhooks/coinbase",
      },
      status: "inactive",
      lastTested: "",
      totalTransactions: 0,
      totalVolume: 0,
    },
    {
      id: "razorpay",
      name: "razorpay",
      displayName: "Razorpay",
      description: "Popular payment gateway for India and Southeast Asia",
      logo: "/assets/gateways/razorpay.svg",
      category: "card",
      isEnabled: false,
      isTestMode: true,
      processingFee: 2.0,
      minAmount: 1.0,
      maxAmount: 100000.0,
      supportedCurrencies: ["INR", "USD"],
      config: {
        keyId: "",
        keySecret: "",
        webhookSecret: "",
        webhookUrl: "https://api.fanzdash.com/webhooks/razorpay",
      },
      status: "inactive",
      lastTested: "",
      totalTransactions: 0,
      totalVolume: 0,
    },
    {
      id: "flutterwave",
      name: "flutterwave",
      displayName: "Flutterwave",
      description: "African payment gateway supporting cards and mobile money",
      logo: "/assets/gateways/flutterwave.svg",
      category: "mobile",
      isEnabled: false,
      isTestMode: true,
      processingFee: 1.4,
      minAmount: 1.0,
      maxAmount: 10000.0,
      supportedCurrencies: ["NGN", "KES", "GHS", "UGX", "USD"],
      config: {
        publicKey: "",
        secretKey: "",
        encryptionKey: "",
        webhookUrl: "https://api.fanzdash.com/webhooks/flutterwave",
      },
      status: "inactive",
      lastTested: "",
      totalTransactions: 0,
      totalVolume: 0,
    },
    {
      id: "mollie",
      name: "mollie",
      displayName: "Mollie",
      description: "European payment processor with local payment methods",
      logo: "/assets/gateways/mollie.svg",
      category: "bank",
      isEnabled: false,
      isTestMode: true,
      processingFee: 2.9,
      minAmount: 0.01,
      maxAmount: 50000.0,
      supportedCurrencies: ["EUR", "USD", "GBP"],
      config: {
        apiKey: "",
        webhookUrl: "https://api.fanzdash.com/webhooks/mollie",
      },
      status: "inactive",
      lastTested: "",
      totalTransactions: 0,
      totalVolume: 0,
    },
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    defaultCurrency: "USD",
    enableTestMode: true,
    requireEmailConfirmation: true,
    enableSaveCards: true,
    enableRefunds: true,
    refundPolicy: "Refunds processed within 5-10 business days",
    failureRetries: 3,
    sessionTimeout: 15, // minutes
    enableFraudDetection: true,
    minimumAmount: 1.0,
    maximumAmount: 10000.0,
    supportedCountries: [
      "US",
      "CA",
      "GB",
      "AU",
      "DE",
      "FR",
      "ES",
      "IT",
      "NL",
      "SE",
      "NO",
      "DK",
    ],
    blockedCountries: ["XX"],
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "card":
        return CreditCard;
      case "digital_wallet":
        return Wallet;
      case "crypto":
        return Bitcoin;
      case "bank":
        return Building2;
      case "mobile":
        return Smartphone;
      default:
        return CreditCard;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleGateway = async (gatewayId: string, enabled: boolean) => {
    setGateways((prev) =>
      prev.map((gw) =>
        gw.id === gatewayId
          ? {
              ...gw,
              isEnabled: enabled,
              status: enabled ? "active" : "inactive",
            }
          : gw,
      ),
    );

    toast({
      title: enabled ? "Gateway Enabled" : "Gateway Disabled",
      description: `${gateways.find((gw) => gw.id === gatewayId)?.displayName} has been ${enabled ? "enabled" : "disabled"}`,
    });
  };

  const testGatewayConnection = async (gatewayId: string) => {
    setIsTestingGateway(gatewayId);

    try {
      // Test gateway connection via API
      const result = await apiRequest(`/api/payment/gateways/${gatewayId}/test`, "POST");

      setGateways((prev) =>
        prev.map((gw) =>
          gw.id === gatewayId
            ? { ...gw, lastTested: new Date().toISOString(), status: "active" }
            : gw,
        ),
      );

      toast({
        title: "Connection Test Successful",
        description: "Gateway connection is working properly",
      });
    } catch (error) {
      setGateways((prev) =>
        prev.map((gw) =>
          gw.id === gatewayId ? { ...gw, status: "error" } : gw,
        ),
      );

      toast({
        title: "Connection Test Failed",
        description: "Failed to connect to payment gateway",
        variant: "destructive",
      });
    } finally {
      setIsTestingGateway(null);
    }
  };

  const updateGatewayConfig = (gatewayId: string, key: string, value: any) => {
    setGateways((prev) =>
      prev.map((gw) =>
        gw.id === gatewayId
          ? { ...gw, config: { ...gw.config, [key]: value } }
          : gw,
      ),
    );
  };

  const toggleSecretVisibility = (gatewayId: string, field: string) => {
    const key = `${gatewayId}_${field}`;
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const saveConfiguration = async () => {
    setIsSaving(true);
    try {
      // Save payment gateway configuration to database
      await apiRequest("/api/payment/gateways/configuration", "POST", { gateways });

      toast({
        title: "Configuration Saved",
        description: "Payment gateway settings have been saved to database successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const GatewayCard = ({ gateway }: { gateway: PaymentGateway }) => {
    const IconComponent = getCategoryIcon(gateway.category);

    return (
      <Card
        className={`hover:shadow-lg transition-all duration-300 ${selectedGateway === gateway.id ? "ring-2 ring-primary" : ""}`}
      >
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-muted rounded-lg">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {gateway.displayName}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {gateway.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {getStatusBadge(gateway.status)}
                <Switch
                  checked={gateway.isEnabled}
                  onCheckedChange={(checked) =>
                    toggleGateway(gateway.id, checked)
                  }
                  data-testid={`${gateway.id}-toggle`}
                />
              </div>
            </div>

            {/* Stats */}
            {gateway.totalTransactions > 0 && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Transactions</div>
                  <div className="font-semibold">
                    {gateway.totalTransactions.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Volume</div>
                  <div className="font-semibold">
                    ${gateway.totalVolume.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">{gateway.processingFee}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Min/Max Amount</span>
                <span className="font-medium">
                  ${gateway.minAmount} - ${gateway.maxAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Test Mode</span>
                <Badge variant={gateway.isTestMode ? "outline" : "secondary"}>
                  {gateway.isTestMode ? (
                    <TestTube className="h-3 w-3 mr-1" />
                  ) : (
                    <Lock className="h-3 w-3 mr-1" />
                  )}
                  {gateway.isTestMode ? "Test" : "Live"}
                </Badge>
              </div>
            </div>

            {/* Supported Currencies */}
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Supported Currencies
              </div>
              <div className="flex flex-wrap gap-1">
                {gateway.supportedCurrencies.slice(0, 4).map((currency) => (
                  <Badge key={currency} variant="outline" className="text-xs">
                    {currency}
                  </Badge>
                ))}
                {gateway.supportedCurrencies.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{gateway.supportedCurrencies.length - 4} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGateway(gateway.id)}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>

              {gateway.isEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => testGatewayConnection(gateway.id)}
                  disabled={isTestingGateway === gateway.id}
                >
                  {isTestingGateway === gateway.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ConfigurationPanel = ({ gateway }: { gateway: PaymentGateway }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-5 w-5" />
          <span>{gateway.displayName} Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(gateway.config).map(([key, value]) => {
          const isSecret =
            key.toLowerCase().includes("secret") ||
            key.toLowerCase().includes("key");
          const showKey = `${gateway.id}_${key}`;

          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={`${gateway.id}_${key}`}>
                {key
                  .split(/(?=[A-Z])/)
                  .join(" ")
                  .replace(/^\w/, (c) => c.toUpperCase())}
                {isSecret && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id={`${gateway.id}_${key}`}
                  type={isSecret && !showSecrets[showKey] ? "password" : "text"}
                  value={value}
                  onChange={(e) =>
                    updateGatewayConfig(gateway.id, key, e.target.value)
                  }
                  placeholder={
                    isSecret ? "Enter secret key..." : `Enter ${key}...`
                  }
                  className={isSecret ? "pr-10" : ""}
                  data-testid={`${gateway.id}-${key}-input`}
                />
                {isSecret && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => toggleSecretVisibility(gateway.id, key)}
                  >
                    {showSecrets[showKey] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor={`${gateway.id}_test_mode`}>Test Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use sandbox/test environment
              </p>
            </div>
            <Switch
              id={`${gateway.id}_test_mode`}
              checked={gateway.isTestMode}
              onCheckedChange={(checked) => {
                setGateways((prev) =>
                  prev.map((gw) =>
                    gw.id === gateway.id ? { ...gw, isTestMode: checked } : gw,
                  ),
                );
              }}
              data-testid={`${gateway.id}-test-mode-toggle`}
            />
          </div>
        </div>

        <Alert
          className={
            gateway.isTestMode ? "border-yellow-500" : "border-green-500"
          }
        >
          {gateway.isTestMode ? (
            <TestTube className="h-4 w-4" />
          ) : (
            <Shield className="h-4 w-4" />
          )}
          <AlertDescription>
            {gateway.isTestMode
              ? "⚠️ Test mode is enabled. No real transactions will be processed."
              : "🔒 Live mode is active. Real transactions will be processed and charged."}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <>
      <SEOHeadTags
        title={generatePageTitle(seoData.title)}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalUrl="https://fanzdash.com/payment-gateway-setup"
        schema={seoData.structuredData}
      />

      <div className="space-y-6">
        <SEOBreadcrumbs items={breadcrumbs} className="mb-6" />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-3">
              <CreditCard className="h-8 w-8 text-primary" />
              <span>Payment Gateway Setup</span>
            </h1>
            <p className="text-muted-foreground">
              Configure and manage payment processors for your platform
            </p>
          </div>

          <Button
            onClick={saveConfiguration}
            disabled={isSaving}
            className="bg-gradient-to-r from-primary to-purple-600"
          >
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="gateways">Gateways</TabsTrigger>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {gateways.filter((gw) => gw.isEnabled).length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Gateways
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {gateways
                      .reduce((sum, gw) => sum + gw.totalTransactions, 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Transactions
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    $
                    {gateways
                      .reduce((sum, gw) => sum + gw.totalVolume, 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Volume
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(
                      (gateways.reduce((sum, gw) => sum + gw.processingFee, 0) /
                        gateways.length) *
                        100,
                    ) / 100}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Processing Fee
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Setup */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Setup Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Recommended Setup:</strong> Enable Stripe for
                      global card payments and PayPal for digital wallet users.
                      This covers 95% of payment preferences worldwide.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Essential Gateways</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Stripe (Global card processing)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>PayPal (Digital wallet)</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Regional Options</h4>
                      <ul className="text-sm space-y-1">
                        <li className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Razorpay (India/Asia)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Flutterwave (Africa)</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span>Mollie (Europe)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gateways Tab */}
          <TabsContent value="gateways" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gateways.map((gateway) => (
                <GatewayCard key={gateway.id} gateway={gateway} />
              ))}
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6">
            {selectedGateway ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedGateway(null)}
                  >
                    ← Back to Gateway List
                  </Button>
                </div>

                {(() => {
                  const gateway = gateways.find(
                    (gw) => gw.id === selectedGateway,
                  );
                  return gateway ? (
                    <ConfigurationPanel gateway={gateway} />
                  ) : null;
                })()}
              </div>
            ) : (
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Select a Gateway to Configure
                </h3>
                <p className="text-muted-foreground mb-6">
                  Choose a payment gateway from the list above to configure its
                  settings
                </p>
                <Button onClick={() => setActiveTab("gateways")}>
                  View Payment Gateways
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Global Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="default-currency">Default Currency</Label>
                    <Select
                      value={globalSettings.defaultCurrency}
                      onValueChange={(value) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          defaultCurrency: value,
                        }))
                      }
                    >
                      <SelectTrigger data-testid="default-currency-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="CAD">
                          CAD - Canadian Dollar
                        </SelectItem>
                        <SelectItem value="AUD">
                          AUD - Australian Dollar
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={globalSettings.sessionTimeout}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          sessionTimeout: parseInt(e.target.value),
                        }))
                      }
                      data-testid="session-timeout-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-amount">Minimum Payment Amount</Label>
                    <Input
                      id="min-amount"
                      type="number"
                      step="0.01"
                      value={globalSettings.minimumAmount}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          minimumAmount: parseFloat(e.target.value),
                        }))
                      }
                      data-testid="min-amount-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-amount">Maximum Payment Amount</Label>
                    <Input
                      id="max-amount"
                      type="number"
                      step="0.01"
                      value={globalSettings.maximumAmount}
                      onChange={(e) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          maximumAmount: parseFloat(e.target.value),
                        }))
                      }
                      data-testid="max-amount-input"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-test-mode">Global Test Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable test mode for all gateways
                      </p>
                    </div>
                    <Switch
                      id="enable-test-mode"
                      checked={globalSettings.enableTestMode}
                      onCheckedChange={(checked) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          enableTestMode: checked,
                        }))
                      }
                      data-testid="enable-test-mode-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-refunds">Enable Refunds</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow automatic refund processing
                      </p>
                    </div>
                    <Switch
                      id="enable-refunds"
                      checked={globalSettings.enableRefunds}
                      onCheckedChange={(checked) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          enableRefunds: checked,
                        }))
                      }
                      data-testid="enable-refunds-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-fraud-detection">
                        Fraud Detection
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Enable automatic fraud prevention
                      </p>
                    </div>
                    <Switch
                      id="enable-fraud-detection"
                      checked={globalSettings.enableFraudDetection}
                      onCheckedChange={(checked) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          enableFraudDetection: checked,
                        }))
                      }
                      data-testid="enable-fraud-detection-toggle"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-save-cards">
                        Save Card Details
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow users to save cards for future payments
                      </p>
                    </div>
                    <Switch
                      id="enable-save-cards"
                      checked={globalSettings.enableSaveCards}
                      onCheckedChange={(checked) =>
                        setGlobalSettings((prev) => ({
                          ...prev,
                          enableSaveCards: checked,
                        }))
                      }
                      data-testid="enable-save-cards-toggle"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refund-policy">Refund Policy</Label>
                  <Textarea
                    id="refund-policy"
                    value={globalSettings.refundPolicy}
                    onChange={(e) =>
                      setGlobalSettings((prev) => ({
                        ...prev,
                        refundPolicy: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Enter your refund policy..."
                    data-testid="refund-policy-input"
                  />
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Security Notice:</strong> All payment data is
                    encrypted and processed securely. We never store sensitive
                    payment information on our servers.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
